import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { dayBounds, parseOptionalDate, toIsoString } from "@life/shared";
import { GraphQLContext } from "../context";
import { assertTaskInHousehold, requireHouseholdUser } from "../auth";

const taskInclude = {
  project: true,
  assignments: { include: { user: true } },
  createdBy: true,
  subtasks: { orderBy: { createdAt: "asc" as const } },
  blockedBy: { include: { dependsOnTask: true } },
} satisfies Prisma.TaskInclude;

type TaskView = "TODAY" | "CALENDAR" | "KANBAN" | "BY_PERSON" | "LIST";

function visibleTaskWhere(householdId: string, userId: string): Prisma.TaskWhereInput {
  return {
    householdId,
    parentId: null,
    OR: [
      { isShared: true },
      { createdById: userId },
      { assignments: { some: { userId } } },
    ],
  };
}

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

  const where: Prisma.TaskWhereInput = visibleTaskWhere(householdId, userId);

  const includeDone = filter?.includeDone || filter?.view === "KANBAN" || filter?.view === "LIST";

  if (!includeDone) {
    where.status = { not: TaskStatus.DONE };
  }

  if (filter?.status) {
    where.status = filter.status;
  }

  if (filter?.assigneeId) {
    where.assignments = { some: { userId: filter.assigneeId } };
  }

  if (filter?.projectId) {
    where.projectId = filter.projectId;
  }

  if (filter?.view === "TODAY") {
    where.AND = [
      {
        OR: [{ dueDate: null }, { dueDate: { lte: todayEnd } }],
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

async function assertUsersInHousehold(
  context: GraphQLContext,
  userIds: string[],
  householdId: string,
) {
  if (userIds.length === 0) {
    return;
  }

  const users = await context.prisma.user.findMany({
    where: { id: { in: userIds }, householdId },
    select: { id: true },
  });

  if (users.length !== userIds.length) {
    throw new Error("One or more assignees are not in this household");
  }
}

async function syncAssignees(
  context: GraphQLContext,
  taskId: string,
  assigneeIds: string[],
  householdId: string,
) {
  await assertUsersInHousehold(context, assigneeIds, householdId);

  await context.prisma.taskAssignment.deleteMany({ where: { taskId } });

  if (assigneeIds.length > 0) {
    await context.prisma.taskAssignment.createMany({
      data: assigneeIds.map((userId) => ({ taskId, userId })),
    });
  }
}

function resolveStatusOnComplete(completed: boolean, current: TaskStatus): TaskStatus {
  if (completed) {
    return TaskStatus.DONE;
  }

  if (current === TaskStatus.DONE) {
    return TaskStatus.TODO;
  }

  return current;
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
          assigneeIds?: string[] | null;
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

      const assigneeIds = input.assigneeIds?.length ? input.assigneeIds : [userId];
      await assertUsersInHousehold(context, assigneeIds, householdId);

      const status = input.status ?? TaskStatus.TODO;
      const task = await context.prisma.task.create({
        data: {
          householdId,
          createdById: userId,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          status,
          priority: input.priority ?? TaskPriority.MEDIUM,
          isShared: input.isShared ?? true,
          dueDate: parseOptionalDate(input.dueDate),
          remindAt: parseOptionalDate(input.remindAt),
          projectId: input.projectId ?? null,
          parentId: input.parentId ?? null,
          completedAt: status === TaskStatus.DONE ? new Date() : null,
          isRecurringTemplate: input.isRecurringTemplate ?? false,
          recurrenceFrequency: input.recurrenceFrequency ?? null,
          recurrenceInterval: input.recurrenceInterval ?? null,
          recurrenceWeekdays: input.recurrenceWeekdays ?? [],
          assignments: {
            create: assigneeIds.map((assigneeId) => ({ userId: assigneeId })),
          },
        },
        include: taskInclude,
      });

      return task;
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
          assigneeIds?: string[] | null;
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
      if (args.input.isRecurringTemplate != null) data.isRecurringTemplate = args.input.isRecurringTemplate;
      if (args.input.recurrenceFrequency !== undefined) data.recurrenceFrequency = args.input.recurrenceFrequency;
      if (args.input.recurrenceInterval !== undefined) data.recurrenceInterval = args.input.recurrenceInterval;
      if (args.input.recurrenceWeekdays !== undefined) {
        data.recurrenceWeekdays = args.input.recurrenceWeekdays ?? [];
      }

      await context.prisma.task.update({
        where: { id: args.id },
        data,
      });

      if (args.input.assigneeIds !== undefined) {
        await syncAssignees(context, args.id, args.input.assigneeIds ?? [], householdId);
      }

      const task = await getTaskById(context, args.id, householdId);
      if (!task) {
        throw new Error("Task not found");
      }

      return task;
    },

    moveTask: async (
      _parent: unknown,
      args: { id: string; status: TaskStatus },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.id, householdId);

      return context.prisma.task.update({
        where: { id: args.id },
        data: {
          status: args.status,
          completedAt: args.status === TaskStatus.DONE ? new Date() : null,
        },
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
      const existing = await getTaskById(context, args.id, householdId);
      if (!existing) {
        throw new Error("Task not found");
      }

      const status = resolveStatusOnComplete(args.completed, existing.status);

      return context.prisma.task.update({
        where: { id: args.id },
        data: {
          status,
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
    assignees: (parent: { assignments?: { user: unknown }[] }) =>
      (parent.assignments ?? []).map((assignment) => assignment.user),
    dueDate: (parent: { dueDate?: Date | null }) => toIsoString(parent.dueDate),
    completedAt: (parent: { completedAt?: Date | null }) => toIsoString(parent.completedAt),
    remindAt: (parent: { remindAt?: Date | null }) => toIsoString(parent.remindAt),
    createdAt: (parent: { createdAt: Date }) => toIsoString(parent.createdAt)!,
    updatedAt: (parent: { updatedAt: Date }) => toIsoString(parent.updatedAt)!,
    isBlocked: (parent: { blockedBy?: { dependsOnTask: { status: TaskStatus } }[] }) =>
      (parent.blockedBy ?? []).some((dep) => dep.dependsOnTask.status !== TaskStatus.DONE),
    isOverdue: (parent: { dueDate?: Date | null; status: TaskStatus }) => {
      if (!parent.dueDate || parent.status === TaskStatus.DONE) {
        return false;
      }

      const { end: todayEnd } = dayBounds();
      return parent.dueDate < todayEnd;
    },
    subtaskProgress: (parent: { subtasks?: { status: TaskStatus }[] }) => {
      const subtasks = parent.subtasks ?? [];
      const total = subtasks.length;
      const completed = subtasks.filter((subtask) => subtask.status === TaskStatus.DONE).length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return { completed, total, percent };
    },
  },

  TaskProject: {
    createdAt: (parent: { createdAt: Date }) => toIsoString(parent.createdAt)!,
    updatedAt: (parent: { updatedAt: Date }) => toIsoString(parent.updatedAt)!,
  },
};
