import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@life/shared";

export type KanbanColumn = {
  status: TaskStatus;
  label: string;
  dotClass: string;
  accentClass: string;
  chipClass: string;
};

export const kanbanColumns: KanbanColumn[] = [
  {
    status: "BACKLOG",
    label: TASK_STATUS_LABELS.BACKLOG,
    dotClass: "bg-status-backlog",
    accentClass: "border-t-status-backlog",
    chipClass: "bg-[#e2e6ea] text-[#495057]",
  },
  {
    status: "TODO",
    label: TASK_STATUS_LABELS.TODO,
    dotClass: "bg-status-todo",
    accentClass: "border-t-status-todo",
    chipClass: "bg-status-todo text-on-primary",
  },
  {
    status: "IN_PROGRESS",
    label: TASK_STATUS_LABELS.IN_PROGRESS,
    dotClass: "bg-status-in-progress",
    accentClass: "border-t-status-in-progress",
    chipClass: "bg-status-in-progress text-on-primary",
  },
  {
    status: "WAITING",
    label: TASK_STATUS_LABELS.WAITING,
    dotClass: "bg-status-waiting",
    accentClass: "border-t-status-waiting",
    chipClass: "bg-status-waiting text-on-primary",
  },
  {
    status: "DONE",
    label: TASK_STATUS_LABELS.DONE,
    dotClass: "bg-status-done",
    accentClass: "border-t-status-done",
    chipClass: "bg-status-done text-on-primary",
  },
];

export const priorityLabels: Record<TaskPriority, string> = { ...TASK_PRIORITY_LABELS };

export const taskPriorities = TASK_PRIORITIES;

export const taskStatuses = TASK_STATUSES;

export function statusLabel(status: string) {
  if (status in TASK_STATUS_LABELS) {
    return TASK_STATUS_LABELS[status as TaskStatus];
  }
  return status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (character) => character.toUpperCase());
}

export function priorityChipClass(priority: string) {
  if (priority === "URGENT") {
    return "bg-error-container text-error";
  }

  if (priority === "HIGH") {
    return "bg-warm-amber text-[#6b3800]";
  }

  if (priority === "LOW") {
    return "bg-muted-blue text-secondary";
  }

  return "bg-sage text-primary-container";
}

export function statusChipClass(status: string) {
  const column = kanbanColumns.find((item) => item.status === status);
  return column?.chipClass ?? "bg-status-todo text-on-primary";
}
