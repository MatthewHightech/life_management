import { Prisma, TaskStatus } from "@prisma/client";
import { dayBounds, isPastDueDate, parseOptionalDate, toIsoString } from "@life/shared";
import { GraphQLContext } from "../context";
import { found, requireHouseholdUser } from "../auth";
import { requireText, timestampFields } from "../fields";
import {
  assertBoard,
  assignTaskTreeToBoard,
  createTaskBoard,
  deleteTaskBoard,
  listBoardsWithTaskCounts,
  moveTaskOntoBoard,
  renameTaskBoard,
  reorderTaskBoards,
  resolveTaskBoardId,
} from "./boards";

const taskInclude = {
  project: true,
  assignments: { include: { user: true } },
  createdBy: true,
  subtasks: { orderBy: { createdAt: "asc" as const } },
  blockedBy: { include: { dependsOnTask: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.TaskInclude;

const commentInclude = {
  author: true,
} satisfies Prisma.TaskCommentInclude;

type TaskView = "TODAY" | "CALENDAR" | "KANBAN" | "BY_PERSON" | "LIST";

type TaskFilter = {
  view?: TaskView | null;
  status?: TaskStatus | null;
  assigneeId?: string | null;
  projectId?: string | null;
  includeDone?: boolean | null;
};

type TaskInput = {
  title: string;
  status?: TaskStatus | null;
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

function buildTaskWhere(householdId: string, userId: string, filter?: TaskFilter): Prisma.TaskWhereInput {
  const where = visibleTaskWhere(householdId, userId);
  const includeDone = filter?.includeDone || filter?.view === "KANBAN" || filter?.view === "LIST";

  if (filter?.status) {
    where.status = filter.status;
  } else if (!includeDone) {
    where.status = { not: TaskStatus.DONE };
  }

  if (filter?.assigneeId) {
    where.assignments = { some: { userId: filter.assigneeId } };
  }

  if (filter?.projectId) {
    where.projectId = filter.projectId;
  }

  if (filter?.view === "TODAY") {
    where.AND = [{ OR: [{ dueDate: null }, { dueDate: { lte: dayBounds().end } }] }];
  }

  if (filter?.view === "CALENDAR") {
    where.dueDate = { not: null };
  }

  return where;
}

async function assertTaskInHousehold(context: GraphQLContext, taskId: string, householdId: string) {
  found(
    await context.prisma.task.findFirst({ where: { id: taskId, householdId }, select: { id: true } }),
    "Task not found in household",
  );
}

async function requireTask(context: GraphQLContext, id: string, householdId: string) {
  return found(
    await context.prisma.task.findFirst({ where: { id, householdId }, include: taskInclude }),
    "Task not found",
  );
}

async function assertVisibleTask(context: GraphQLContext, id: string, householdId: string, userId: string) {
  found(
    await context.prisma.task.findFirst({
      where: { id, ...visibleTaskWhere(householdId, userId) },
      select: { id: true },
    }),
    "Task not found",
  );
}

async function markTaskCommentsReadForUser(context: GraphQLContext, taskId: string, userId: string) {
  const readAt = new Date();
  await context.prisma.taskCommentRead.upsert({
    where: { userId_taskId: { userId, taskId } },
    create: { userId, taskId, readAt },
    update: { readAt },
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

export const taskResolvers = {
  Query: {
    tasks: async (_parent: unknown, args: { filter?: TaskFilter }, context: GraphQLContext) => {
      const { householdId, userId } = await requireHouseholdUser(context);

      return context.prisma.task.findMany({
        where: buildTaskWhere(householdId, userId, args.filter),
        include: taskInclude,
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      });
    },

    task: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return context.prisma.task.findFirst({
        where: { id: args.id, householdId },
        include: taskInclude,
      });
    },

    taskProjects: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return listBoardsWithTaskCounts(context.prisma, householdId);
    },

    taskComments: async (_parent: unknown, args: { taskId: string }, context: GraphQLContext) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      await assertVisibleTask(context, args.taskId, householdId, userId);

      return context.prisma.taskComment.findMany({
        where: { taskId: args.taskId },
        include: commentInclude,
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    createTask: async (_parent: unknown, args: { input: TaskInput }, context: GraphQLContext) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const { input } = args;

      if (input.parentId) {
        await assertTaskInHousehold(context, input.parentId, householdId);
      }

      const projectId = await resolveTaskBoardId(context.prisma, householdId, {
        projectId: input.projectId,
        parentId: input.parentId,
      });

      const assigneeIds = input.assigneeIds?.length ? input.assigneeIds : [userId];
      await assertUsersInHousehold(context, assigneeIds, householdId);

      const status = input.status ?? TaskStatus.TODO;
      return context.prisma.task.create({
        data: {
          householdId,
          createdById: userId,
          title: input.title.trim(),
          status,
          isShared: input.isShared ?? true,
          dueDate: parseOptionalDate(input.dueDate),
          remindAt: parseOptionalDate(input.remindAt),
          projectId,
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
    },

    updateTask: async (
      _parent: unknown,
      args: { id: string; input: Omit<Partial<TaskInput>, "title"> & { title?: string | null } },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const { input } = args;
      await assertTaskInHousehold(context, args.id, householdId);

      if (input.projectId !== undefined) {
        if (!input.projectId) {
          throw new Error("Task must belong to a board");
        }
        await assignTaskTreeToBoard(context.prisma, householdId, args.id, input.projectId);
      }

      await context.prisma.task.update({
        where: { id: args.id },
        data: {
          title: input.title?.trim() ?? undefined,
          ...(input.status != null && {
            status: input.status,
            completedAt: input.status === TaskStatus.DONE ? new Date() : null,
          }),
          isShared: input.isShared ?? undefined,
          dueDate: input.dueDate === undefined ? undefined : parseOptionalDate(input.dueDate),
          remindAt: input.remindAt === undefined ? undefined : parseOptionalDate(input.remindAt),
          parent:
            input.parentId === undefined
              ? undefined
              : input.parentId
                ? { connect: { id: input.parentId } }
                : { disconnect: true },
          isRecurringTemplate: input.isRecurringTemplate ?? undefined,
          recurrenceFrequency: input.recurrenceFrequency,
          recurrenceInterval: input.recurrenceInterval,
          recurrenceWeekdays:
            input.recurrenceWeekdays === undefined ? undefined : (input.recurrenceWeekdays ?? []),
        },
      });

      if (input.assigneeIds !== undefined) {
        await syncAssignees(context, args.id, input.assigneeIds ?? [], householdId);
      }

      return requireTask(context, args.id, householdId);
    },

    moveTask: async (
      _parent: unknown,
      args: { id: string; status: TaskStatus; projectId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.id, householdId);
      await moveTaskOntoBoard(context.prisma, {
        householdId,
        taskId: args.id,
        status: args.status,
        projectId: args.projectId,
      });

      return requireTask(context, args.id, householdId);
    },

    deleteTask: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.id, householdId);
      await context.prisma.task.delete({ where: { id: args.id } });
      return true;
    },

    clearDoneTasks: async (
      _parent: unknown,
      args: { projectId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);

      if (args.projectId) {
        await assertBoard(context.prisma, householdId, args.projectId);
      }

      const result = await context.prisma.task.deleteMany({
        where: {
          ...visibleTaskWhere(householdId, userId),
          status: TaskStatus.DONE,
          projectId: args.projectId || undefined,
        },
      });

      return result.count;
    },

    completeTask: async (
      _parent: unknown,
      args: { id: string; completed: boolean },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const existing = await requireTask(context, args.id, householdId);

      const reopenedStatus = existing.status === TaskStatus.DONE ? TaskStatus.TODO : existing.status;

      return context.prisma.task.update({
        where: { id: args.id },
        data: {
          status: args.completed ? TaskStatus.DONE : reopenedStatus,
          completedAt: args.completed ? new Date() : null,
        },
        include: taskInclude,
      });
    },

    createTaskProject: async (_parent: unknown, args: { name: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return createTaskBoard(context.prisma, householdId, args.name);
    },

    renameTaskProject: async (
      _parent: unknown,
      args: { id: string; name: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      return renameTaskBoard(context.prisma, householdId, args.id, args.name);
    },

    reorderTaskProjects: async (_parent: unknown, args: { ids: string[] }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return reorderTaskBoards(context.prisma, householdId, args.ids);
    },

    deleteTaskProject: async (
      _parent: unknown,
      args: { id: string; moveTasksToProjectId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await deleteTaskBoard(context.prisma, householdId, args.id, args.moveTasksToProjectId);
      return true;
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
        data: { taskId: args.taskId, dependsOnTaskId: args.dependsOnTaskId },
      });

      return requireTask(context, args.taskId, householdId);
    },

    removeTaskDependency: async (
      _parent: unknown,
      args: { taskId: string; dependsOnTaskId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertTaskInHousehold(context, args.taskId, householdId);

      await context.prisma.taskDependency.deleteMany({
        where: { taskId: args.taskId, dependsOnTaskId: args.dependsOnTaskId },
      });

      return requireTask(context, args.taskId, householdId);
    },

    addTaskComment: async (
      _parent: unknown,
      args: { taskId: string; body: string },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      await assertVisibleTask(context, args.taskId, householdId, userId);
      const body = requireText(args.body, "Comment cannot be empty");

      const comment = await context.prisma.taskComment.create({
        data: { taskId: args.taskId, authorId: userId, body },
        include: commentInclude,
      });

      await markTaskCommentsReadForUser(context, args.taskId, userId);
      return comment;
    },

    deleteTaskComment: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const comment = found(
        await context.prisma.taskComment.findFirst({ where: { id: args.id, task: { householdId } } }),
        "Comment not found",
      );

      if (comment.authorId !== userId) {
        throw new Error("You can only delete your own comments");
      }

      await context.prisma.taskComment.delete({ where: { id: args.id } });
      return true;
    },

    markTaskCommentsRead: async (
      _parent: unknown,
      args: { taskId: string },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      await assertVisibleTask(context, args.taskId, householdId, userId);
      await markTaskCommentsReadForUser(context, args.taskId, userId);
      return true;
    },
  },

  Task: {
    ...timestampFields,
    assignees: (parent: { assignments?: { user: unknown }[] }) =>
      (parent.assignments ?? []).map((assignment) => assignment.user),
    dueDate: (parent: { dueDate?: Date | null }) => toIsoString(parent.dueDate),
    completedAt: (parent: { completedAt?: Date | null }) => toIsoString(parent.completedAt),
    remindAt: (parent: { remindAt?: Date | null }) => toIsoString(parent.remindAt),
    isBlocked: (parent: { blockedBy?: { dependsOnTask: { status: TaskStatus } }[] }) =>
      (parent.blockedBy ?? []).some((dep) => dep.dependsOnTask.status !== TaskStatus.DONE),
    isOverdue: (parent: { dueDate?: Date | null; status: TaskStatus }) =>
      parent.status !== TaskStatus.DONE && parent.dueDate != null && isPastDueDate(parent.dueDate),
    subtaskProgress: (parent: { subtasks?: { status: TaskStatus }[] }) => {
      const subtasks = parent.subtasks ?? [];
      const total = subtasks.length;
      const completed = subtasks.filter((subtask) => subtask.status === TaskStatus.DONE).length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return { completed, total, percent };
    },
    commentCount: (parent: { _count?: { comments: number } }) => parent._count?.comments ?? 0,
    unreadCommentCount: async (
      parent: { id: string },
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user?.id) {
        return 0;
      }

      const read = await context.prisma.taskCommentRead.findUnique({
        where: { userId_taskId: { userId: context.user.id, taskId: parent.id } },
      });

      return context.prisma.taskComment.count({
        where: {
          taskId: parent.id,
          createdAt: { gt: read?.readAt ?? new Date(0) },
        },
      });
    },
  },

  TaskComment: {
    createdAt: timestampFields.createdAt,
    canDelete: (parent: { authorId: string }, _args: unknown, context: GraphQLContext) =>
      Boolean(context.user?.id && parent.authorId === context.user.id),
  },

  TaskProject: timestampFields,
};
