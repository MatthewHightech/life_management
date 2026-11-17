export const DEFAULT_TASK_BOARD_NAME = "Family Tasks";

export const TASK_STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "WAITING", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  WAITING: "Waiting",
  DONE: "Done",
};
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  BACKLOG: "#7b8794",
  TODO: "#1a8f9c",
  IN_PROGRESS: "#f1b74b",
  WAITING: "#ec724d",
  DONE: "#3d9b5c",
};

const ACTIVE_STATUS_RANK: Record<Exclude<TaskStatus, "DONE">, number> = {
  WAITING: 1,
  IN_PROGRESS: 2,
  TODO: 3,
  BACKLOG: 4,
};
export type ListSortableTask = {
  title: string;
  status: TaskStatus;
  isOverdue: boolean;
  dueDate?: string | null;
  completedAt?: string | null;
};

function activeTaskSortRank(task: ListSortableTask): number {
  if (task.isOverdue) {
    return 0;
  }

  if (task.status === "DONE") {
    return 99;
  }

  return ACTIVE_STATUS_RANK[task.status];
}

export function compareActiveListTasks(a: ListSortableTask, b: ListSortableTask): number {
  const rankDiff = activeTaskSortRank(a) - activeTaskSortRank(b);
  if (rankDiff !== 0) {
    return rankDiff;
  }

  if (a.isOverdue && b.isOverdue && a.dueDate && b.dueDate) {
    return a.dueDate.localeCompare(b.dueDate);
  }

  return a.title.localeCompare(b.title);
}

export function compareDoneListTasks(a: ListSortableTask, b: ListSortableTask): number {
  const completedDiff = (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
  if (completedDiff !== 0) {
    return completedDiff;
  }

  return a.title.localeCompare(b.title);
}

export function partitionListTasks<T extends ListSortableTask>(tasks: T[]) {
  const activeTasks = tasks.filter((task) => task.status !== "DONE").sort(compareActiveListTasks);
  const doneTasks = tasks.filter((task) => task.status === "DONE").sort(compareDoneListTasks);

  return { activeTasks, doneTasks };
}
export function groupTasksByStatus<T extends ListSortableTask>(tasks: T[]) {
  const groups = Object.fromEntries(TASK_STATUSES.map((status) => [status, [] as T[]])) as Record<
    TaskStatus,
    T[]
  >;

  for (const task of tasks) {
    groups[task.status].push(task);
  }

  for (const status of TASK_STATUSES) {
    groups[status].sort(status === "DONE" ? compareDoneListTasks : compareActiveListTasks);
  }

  return groups;
}

export function toggleAssigneeId(selectedIds: string[], userId: string): string[] {
  return selectedIds.includes(userId)
    ? selectedIds.filter((id) => id !== userId)
    : [...selectedIds, userId];
}
