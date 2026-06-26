import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { dayBounds, parseOptionalDate, toIsoString } from "@life/shared";
import { GraphQLContext } from "../context";
import { assertTaskInHousehold, requireHouseholdUser } from "../auth";

const taskInclude = {
  project: true,
  assignee: true,
  createdBy: true,
  subtasks: { orderBy: { createdAt: "asc" as const } },
  blockedBy: { include: { dependsOnTask: true } },
} satisfies Prisma.TaskInclude;

type TaskView = "TODAY" | "CALENDAR" | "KANBAN" | "BY_PERSON";

function buildTaskWhere(
  householdId: string,
  userId: string,
  filter?: {
    view?: TaskView | null;
    status?: TaskStatus | null;
    assigneeId?: string | null;
    projectId?: string | null;
    includeDone?: boolean | null;
  },
): Prisma.TaskWhereInput {
  const { end: todayEnd } = dayBounds();

  const where: Prisma.TaskWhereInput = {
    householdId,
    parentId: null,
    OR: [{ isShared: true }, { createdById: userId }, { assigneeId: userId }],
  };

  if (!filter?.includeDone) {
    where.status = { not: TaskStatus.DONE };
  }

  if (filter?.status) {
    where.status = filter.status;
  }

  if (filter?.assigneeId) {
    where.assigneeId = filter.assigneeId;
  }

  if (filter?.projectId) {
    where.projectId = filter.projectId;
  }

  if (filter?.view === "TODAY") {
    where.AND = [
      {
        OR: [
          { dueDate: null },
          { dueDate: { lte: todayEnd } },
        ],
      },
    ];
  }

  if (filter?.view === "CALENDAR") {
    where.dueDate = { not: null };
  }

  return where;
}

async function getTaskById(context: GraphQLContext, id: string, householdId: string) {
  return context.prisma.task.findFirst({
    where: { id, householdId },
    include: taskInclude,
  });
}

export const taskResolvers = {
  Query: {
    tasks: async (
      _parent: unknown,
      args: { filter?: Parameters<typeof buildTaskWhere>[2] },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);

      return context.prisma.task.findMany({
        where: buildTaskWhere(householdId, userId, args.filter),
        include: taskInclude,
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
      });
    },

    task: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return getTaskById(context, args.id, householdId);
    },

    taskProjects: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);

      const projects = await context.prisma.taskProject.findMany({
        where: { householdId },
        include: { _count: { select: { tasks: true } } },
        orderBy: { name: "asc" },
      });

      return projects.map((project) => ({
        ...project,
        taskCount: project._count.tasks,
      }));
    },
  },

  Mutation: {
    createTask: async (
      _parent: unknown,
      args: {
        input: {
          title: string;
          description?: string | null;
          status?: TaskStatus | null;
          priority?: TaskPriority | null;
          isShared?: boolean | null;
          dueDate?: string | null;
          remindAt?: string | null;
          projectId?: string | null;
          parentId?: string | null;
          assigneeId?: string | null;
          isRecurringTemplate?: boolean | null;
          recurrenceFrequency?: "DAILY" | "WEEKLY" | "MONTHLY" | null;
          recurrenceInterval?: number | null;
          recurrenceWeekdays?: number[] | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const { input } = args;

      if (input.parentId) {
        await assertTaskInHousehold(context, input.parentId, householdId);
      }

      if (input.projectId) {
        const project = await context.prisma.taskProject.findFirst({
          where: { id: input.projectId, householdId },
        });
        if (!project) {
          throw new Error("Project not found");
        }
      }

      return context.prisma.task.create({
        data: {
          householdId,
          createdById: userId,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          status: input.status ?? TaskStatus.TODO,
          priority: input.priority ?? TaskPriority.MEDIUM,
          isShared: input.isShared ?? true,
          dueDate: parseOptionalDate(input.dueDate),
          remindAt: parseOptionalDate(input.remindAt),
          projectId: input.projectId ?? null,
          parentId: input.parentId ?? null,
          assigneeId: input.assigneeId ?? userId,
          isRecurringTemplate: input.isRecurringTemplate ?? false,
          recurrenceFrequency: input.recurrenceFrequency ?? null,
          recurrenceInterval: input.recurrenceInterval ?? null,
          recurrenceWeekdays: input.recurrenceWeekdays ?? [],
        },
        include: taskInclude,
      });
    },

    updateTask: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          title?: string | null;
          description?: string | null;
          status?: TaskStatus | null;
          priority?: TaskPriority | null;
          isShared?: boolean | null;
          dueDate?: string | null;
          remindAt?: string | null;
          projectId?: string | null;
          parentId?: string | null;
          assigneeId?: string | null;
          isRecurringTemplate?: boolean | null;
          recurrenceFrequency?: "DAILY" | "WEEKLY" | "MONTHLY" | null;
          recurrenceInterval?: number | null;
          recurrenceWeekdays?: number[] | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.id, householdId);

      const data: Prisma.TaskUpdateInput = {};

      if (args.input.title != null) data.title = args.input.title.trim();
      if (args.input.description !== undefined) data.description = args.input.description?.trim() || null;
      if (args.input.status != null) {
        data.status = args.input.status;
        data.completedAt = args.input.status === TaskStatus.DONE ? new Date() : null;
      }
      if (args.input.priority != null) data.priority = args.input.priority;
      if (args.input.isShared != null) data.isShared = args.input.isShared;
      if (args.input.dueDate !== undefined) data.dueDate = parseOptionalDate(args.input.dueDate);
      if (args.input.remindAt !== undefined) data.remindAt = parseOptionalDate(args.input.remindAt);
      if (args.input.projectId !== undefined) {
        data.project = args.input.projectId
          ? { connect: { id: args.input.projectId } }
          : { disconnect: true };
      }
      if (args.input.parentId !== undefined) {
        data.parent = args.input.parentId ? { connect: { id: args.input.parentId } } : { disconnect: true };
      }
      if (args.input.assigneeId !== undefined) {
        data.assignee = args.input.assigneeId ? { connect: { id: args.input.assigneeId } } : { disconnect: true };
      }
      if (args.input.isRecurringTemplate != null) data.isRecurringTemplate = args.input.isRecurringTemplate;
      if (args.input.recurrenceFrequency !== undefined) data.recurrenceFrequency = args.input.recurrenceFrequency;
      if (args.input.recurrenceInterval !== undefined) data.recurrenceInterval = args.input.recurrenceInterval;
      if (args.input.recurrenceWeekdays !== undefined) {
        data.recurrenceWeekdays = args.input.recurrenceWeekdays ?? [];
      }

      return context.prisma.task.update({
        where: { id: args.id },
        data,
        include: taskInclude,
      });
    },

    deleteTask: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.id, householdId);
      await context.prisma.task.delete({ where: { id: args.id } });
      return true;
    },

    completeTask: async (
      _parent: unknown,
      args: { id: string; completed: boolean },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.id, householdId);

      return context.prisma.task.update({
        where: { id: args.id },
        data: {
          status: args.completed ? TaskStatus.DONE : TaskStatus.TODO,
          completedAt: args.completed ? new Date() : null,
        },
        include: taskInclude,
      });
    },

    createTaskProject: async (_parent: unknown, args: { name: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);

      const project = await context.prisma.taskProject.create({
        data: {
          householdId,
          name: args.name.trim(),
        },
        include: { _count: { select: { tasks: true } } },
      });

      return { ...project, taskCount: project._count.tasks };
    },

    addTaskDependency: async (
      _parent: unknown,
      args: { taskId: string; dependsOnTaskId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.taskId, householdId);
      await assertTaskInHousehold(context, args.dependsOnTaskId, householdId);

      if (args.taskId === args.dependsOnTaskId) {
        throw new Error("A task cannot depend on itself");
      }

      await context.prisma.taskDependency.create({
        data: {
          taskId: args.taskId,
          dependsOnTaskId: args.dependsOnTaskId,
        },
      });

      const task = await getTaskById(context, args.taskId, householdId);
      if (!task) {
        throw new Error("Task not found");
      }

      return task;
    },

    removeTaskDependency: async (
      _parent: unknown,
      args: { taskId: string; dependsOnTaskId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.taskId, householdId);

      await context.prisma.taskDependency.deleteMany({
        where: {
          taskId: args.taskId,
          dependsOnTaskId: args.dependsOnTaskId,
        },
      });

      const task = await getTaskById(context, args.taskId, householdId);
      if (!task) {
        throw new Error("Task not found");
      }

      return task;
    },
  },

  Task: {
    dueDate: (parent: { dueDate?: Date | null }) => toIsoString(parent.dueDate),
    completedAt: (parent: { completedAt?: Date | null }) => toIsoString(parent.completedAt),
    remindAt: (parent: { remindAt?: Date | null }) => toIsoString(parent.remindAt),
    createdAt: (parent: { createdAt: Date }) => toIsoString(parent.createdAt)!,
    updatedAt: (parent: { updatedAt: Date }) => toIsoString(parent.updatedAt)!,
    isBlocked: (parent: { blockedBy?: { dependsOnTask: { status: TaskStatus } }[] }) =>
      (parent.blockedBy ?? []).some((dep) => dep.dependsOnTask.status !== TaskStatus.DONE),
  },

  TaskProject: {
    createdAt: (parent: { createdAt: Date }) => toIsoString(parent.createdAt)!,
    updatedAt: (parent: { updatedAt: Date }) => toIsoString(parent.updatedAt)!,
  },
};
