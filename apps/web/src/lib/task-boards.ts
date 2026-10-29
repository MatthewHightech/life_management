import { DEFAULT_TASK_BOARD_NAME } from "@life/shared";

export function moveBoardBefore<T extends { id: string }>(items: T[], activeId: string, overId: string): T[] {
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (from < 0 || to < 0 || from === to) {
    return items;
  }

  const next = items.slice();
  const [moved] = next.splice(from, 1);
  if (!moved) {
    return items;
  }
  next.splice(to, 0, moved);
  return next;
}

export function defaultBoardMoveTarget<T extends { id: string; name: string }>(
  boards: T[],
  deletingId: string,
): T | null {
  const others = boards.filter((board) => board.id !== deletingId);
  return others.find((board) => board.name === DEFAULT_TASK_BOARD_NAME) ?? others[0] ?? null;
}

export function tasksOnBoard<T extends { project?: { id: string } | null }>(
  tasks: T[],
  boardId: string | null,
  fallbackBoardId: string | null,
): T[] {
  if (!boardId) {
    return [];
  }

  return tasks.filter((task) => (task.project?.id ?? fallbackBoardId) === boardId);
}
