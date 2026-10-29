import { Prisma, PrismaClient, TaskStatus } from "@prisma/client";
import { DEFAULT_TASK_BOARD_NAME } from "@life/shared";

type BoardDb = PrismaClient | Prisma.TransactionClient;

export async function ensureHouseholdBoards(prisma: PrismaClient, householdId: string) {
  return prisma.$transaction(async (tx) => {
    // Serialize board creation so two first visits cannot insert two default boards.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${householdId}, 0))`;

    let boards = await tx.taskProject.findMany({
      where: { householdId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    const orphanCount = await tx.task.count({
      where: { householdId, projectId: null },
    });

    if (boards.length === 0 || orphanCount > 0) {
      let home = boards.find((board) => board.name === DEFAULT_TASK_BOARD_NAME) ?? null;
      if (!home) {
        const minOrder = boards.reduce((min, board) => Math.min(min, board.sortOrder), 0);
        home = await tx.taskProject.create({
          data: {
            householdId,
            name: DEFAULT_TASK_BOARD_NAME,
            sortOrder: boards.length === 0 ? 0 : minOrder - 1,
          },
        });
        boards = [home, ...boards];
      }

      if (orphanCount > 0) {
        await tx.task.updateMany({
          where: { householdId, projectId: null },
          data: { projectId: home.id },
        });
      }
    }

    return tx.taskProject.findMany({
      where: { householdId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  });
}

export async function resolveTaskBoardId(
  prisma: PrismaClient,
  householdId: string,
  input: { projectId?: string | null; parentId?: string | null },
) {
  if (input.projectId) {
    const project = await prisma.taskProject.findFirst({
      where: { id: input.projectId, householdId },
      select: { id: true },
    });
    if (!project) {
      throw new Error("Board not found");
    }
    return project.id;
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

  const boards = await ensureHouseholdBoards(prisma, householdId);
  const first = boards[0];
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
    frontier = [];
    for (const child of children) {
      if (seen.has(child.id)) {
        continue;
      }
      seen.add(child.id);
      ids.push(child.id);
      frontier.push(child.id);
    }
  }

  return ids;
}

async function assertBoard(db: BoardDb, householdId: string, boardId: string) {
  const board = await db.taskProject.findFirst({
    where: { id: boardId, householdId },
  });
  if (!board) {
    throw new Error("Board not found");
  }
  return board;
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
      args.status === TaskStatus.DONE ? (task.status === TaskStatus.DONE ? task.completedAt ?? new Date() : new Date()) : null;

    await tx.task.update({
      where: { id: task.id },
      data: {
        status: args.status,
        completedAt,
        projectId,
      },
    });
  });
}

export async function createTaskBoard(prisma: PrismaClient, householdId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Board name cannot be empty");
  }

  await ensureHouseholdBoards(prisma, householdId);
  const last = await prisma.taskProject.aggregate({
    where: { householdId },
    _max: { sortOrder: true },
  });

  return prisma.taskProject.create({
    data: {
      householdId,
      name: trimmed,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  });
}

export async function renameTaskBoard(prisma: PrismaClient, householdId: string, boardId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Board name cannot be empty");
  }

  await assertBoard(prisma, householdId, boardId);
  return prisma.taskProject.update({
    where: { id: boardId },
    data: { name: trimmed },
  });
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
    if (!boards.some((board) => board.id === boardId)) {
      throw new Error("Board not found");
    }
    if (boards.length <= 1) {
      throw new Error("Keep at least one board");
    }

    if (moveTasksToProjectId) {
      if (moveTasksToProjectId === boardId) {
        throw new Error("Choose a different board");
      }
      if (!boards.some((board) => board.id === moveTasksToProjectId)) {
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

export async function countRootTasksByBoard(prisma: PrismaClient, householdId: string) {
  const counts = await prisma.task.groupBy({
    by: ["projectId"],
    where: { householdId, parentId: null },
    _count: { _all: true },
  });

  return new Map(counts.map((row) => [row.projectId, row._count._all]));
}
