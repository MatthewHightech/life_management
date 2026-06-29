import type { TasksBoardQuery, TaskStatus } from "@/graphql";

type BoardTask = TasksBoardQuery["tasks"][number];

const ACTIVE_STATUS_RANK: Record<Exclude<TaskStatus, "DONE">, number> = {
  WAITING: 1,
  IN_PROGRESS: 2,
  TODO: 3,
  BACKLOG: 4,
};

function activeTaskSortRank(task: BoardTask): number {
  if (task.isOverdue) {
    return 0;
  }

  if (task.status === "DONE") {
    return 99;
  }

  return ACTIVE_STATUS_RANK[task.status];
}

export function compareActiveListTasks(a: BoardTask, b: BoardTask): number {
  const rankDiff = activeTaskSortRank(a) - activeTaskSortRank(b);
  if (rankDiff !== 0) {
    return rankDiff;
  }

  if (a.isOverdue && b.isOverdue && a.dueDate && b.dueDate) {
    return a.dueDate.localeCompare(b.dueDate);
  }

  return a.title.localeCompare(b.title);
}

export function compareDoneListTasks(a: BoardTask, b: BoardTask): number {
  const completedDiff = (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
  if (completedDiff !== 0) {
    return completedDiff;
  }

  return a.title.localeCompare(b.title);
}

export function partitionListTasks(tasks: BoardTask[]) {
  const activeTasks = tasks.filter((task) => task.status !== "DONE").sort(compareActiveListTasks);
  const doneTasks = tasks.filter((task) => task.status === "DONE").sort(compareDoneListTasks);

  return { activeTasks, doneTasks };
}
