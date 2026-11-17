import { Prisma, PrismaClient, TaskStatus } from "@prisma/client";
import { DEFAULT_TASK_BOARD_NAME } from "@life/shared";
import { requireText } from "../fields";

type BoardDb = PrismaClient | Prisma.TransactionClient;

const BOARD_NAME_REQUIRED = "Board name cannot be empty";
const boardOrder = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

async function serializeBoardCreationForHousehold(tx: Prisma.TransactionClient, householdId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${householdId}, 0))`;
}

async function ensureHouseholdBoards(prisma: PrismaClient, householdId: string) {
  return prisma.$transaction(async (tx) => {
    await serializeBoardCreationForHousehold(tx, householdId);

    const boards = await tx.taskProject.findMany({ where: { householdId }, orderBy: boardOrder });
    const orphanCount = await tx.task.count({ where: { householdId, projectId: null } });

    if (boards.length === 0 || orphanCount > 0) {
      const home =
        boards.find((board) => board.name === DEFAULT_TASK_BOARD_NAME) ??
        (await tx.taskProject.create({
          data: {
            householdId,
            name: DEFAULT_TASK_BOARD_NAME,
            sortOrder:
              boards.length === 0 ? 0 : Math.min(0, ...boards.map((board) => board.sortOrder)) - 1,
          },
        }));

      if (orphanCount > 0) {
        await tx.task.updateMany({
          where: { householdId, projectId: null },
          data: { projectId: home.id },
        });
      }
    }

    return tx.taskProject.findMany({ where: { householdId }, orderBy: boardOrder });
  });
}

function countRootTasks(prisma: PrismaClient, householdId: string, projectId: string) {
  return prisma.task.count({ where: { householdId, parentId: null, projectId } });
}

export async function listBoardsWithTaskCounts(prisma: PrismaClient, householdId: string) {
  const boards = await ensureHouseholdBoards(prisma, householdId);
  const counts = await prisma.task.groupBy({
    by: ["projectId"],
    where: { householdId, parentId: null },
    _count: { _all: true },
  });
  const countByBoard = new Map(counts.map((row) => [row.projectId, row._count._all]));

  return boards.map((board) => ({ ...board, taskCount: countByBoard.get(board.id) ?? 0 }));
}

export async function assertBoard(db: BoardDb, householdId: string, boardId: string) {
  const board = await db.taskProject.findFirst({ where: { id: boardId, householdId } });
  if (!board) {
    throw new Error("Board not found");
  }
  return board;
}

export async function resolveTaskBoardId(
  prisma: PrismaClient,
  householdId: string,
  input: { projectId?: string | null; parentId?: string | null },
) {
  if (input.projectId) {
    return (await assertBoard(prisma, householdId, input.projectId)).id;
  }

  if (input.parentId) {
    const parent = await prisma.task.findFirst({
      where: { id: input.parentId, householdId },
      select: { projectId: true },
    });
    if (parent?.projectId) {
      return parent.projectId;
    }
  }

  const [first] = await ensureHouseholdBoards(prisma, householdId);
  if (!first) {
    throw new Error("Board not found");
  }
  return first.id;
}

async function collectDescendantIds(db: BoardDb, rootId: string) {
  const ids: string[] = [];
  const seen = new Set<string>([rootId]);
  let frontier = [rootId];

  while (frontier.length > 0) {
    const children = await db.task.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    frontier = children.map((child) => child.id).filter((id) => !seen.has(id));
    for (const id of frontier) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

export async function assignTaskTreeToBoard(
  prisma: PrismaClient,
  householdId: string,
  taskId: string,
  projectId: string,
) {
  await prisma.$transaction(async (tx) => {
    await assertBoard(tx, householdId, projectId);
    const descendantIds = await collectDescendantIds(tx, taskId);
    await tx.task.updateMany({
      where: { id: { in: [taskId, ...descendantIds] }, householdId },
      data: { projectId },
    });
  });
}

export async function moveTaskOntoBoard(
  prisma: PrismaClient,
  args: { householdId: string; taskId: string; status: TaskStatus; projectId?: string | null },
) {
  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id: args.taskId, householdId: args.householdId },
    });
    if (!task) {
      throw new Error("Task not found");
    }

    let projectId = task.projectId;
    if (args.projectId && args.projectId !== task.projectId) {
      await assertBoard(tx, args.householdId, args.projectId);
      projectId = args.projectId;
      const descendantIds = await collectDescendantIds(tx, task.id);
      if (descendantIds.length > 0) {
        await tx.task.updateMany({
          where: { id: { in: descendantIds }, householdId: args.householdId },
          data: { projectId },
        });
      }
    }

    const completedAt =
      args.status === TaskStatus.DONE
        ? (task.status === TaskStatus.DONE && task.completedAt) || new Date()
        : null;

    await tx.task.update({
      where: { id: task.id },
      data: { status: args.status, completedAt, projectId },
    });
  });
}

export async function createTaskBoard(prisma: PrismaClient, householdId: string, name: string) {
  const trimmed = requireText(name, BOARD_NAME_REQUIRED);

  await ensureHouseholdBoards(prisma, householdId);
  const last = await prisma.taskProject.aggregate({
    where: { householdId },
    _max: { sortOrder: true },
  });

  const board = await prisma.taskProject.create({
    data: { householdId, name: trimmed, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });
  return { ...board, taskCount: 0 };
}

export async function renameTaskBoard(prisma: PrismaClient, householdId: string, boardId: string, name: string) {
  const trimmed = requireText(name, BOARD_NAME_REQUIRED);

  await assertBoard(prisma, householdId, boardId);
  const board = await prisma.taskProject.update({
    where: { id: boardId },
    data: { name: trimmed },
  });
  return { ...board, taskCount: await countRootTasks(prisma, householdId, boardId) };
}

export async function reorderTaskBoards(prisma: PrismaClient, householdId: string, ids: string[]) {
  const boards = await prisma.taskProject.findMany({
    where: { householdId },
    select: { id: true },
  });
  const existing = new Set(boards.map((board) => board.id));
  if (ids.length !== existing.size || ids.some((id) => !existing.has(id))) {
    throw new Error("Board list is out of date");
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.taskProject.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return listBoardsWithTaskCounts(prisma, householdId);
}

export async function deleteTaskBoard(
  prisma: PrismaClient,
  householdId: string,
  boardId: string,
  moveTasksToProjectId?: string | null,
) {
  await prisma.$transaction(async (tx) => {
    const boards = await tx.taskProject.findMany({
      where: { householdId },
      select: { id: true },
    });
    const boardExists = (id: string) => boards.some((board) => board.id === id);

    if (!boardExists(boardId)) {
      throw new Error("Board not found");
    }
    if (boards.length <= 1) {
      throw new Error("Keep at least one board");
    }

    if (moveTasksToProjectId) {
      if (moveTasksToProjectId === boardId) {
        throw new Error("Choose a different board");
      }
      if (!boardExists(moveTasksToProjectId)) {
        throw new Error("Board not found");
      }
      await tx.task.updateMany({
        where: { householdId, projectId: boardId },
        data: { projectId: moveTasksToProjectId },
      });
    } else {
      await tx.task.deleteMany({
        where: { householdId, projectId: boardId },
      });
    }

    await tx.taskProject.delete({ where: { id: boardId } });
  });
}
