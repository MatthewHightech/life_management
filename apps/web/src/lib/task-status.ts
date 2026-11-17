import { TASK_STATUS_LABELS, type TaskStatus } from "@life/shared";

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

export const kanbanColumnByStatus = Object.fromEntries(
  kanbanColumns.map((column) => [column.status, column]),
) as Record<TaskStatus, KanbanColumn>;

export const statusSelectOptions = kanbanColumns.map((column) => ({
  value: column.status,
  label: column.label,
  chipClassName: column.chipClass,
}));

export function statusTriggerDisplay(status: TaskStatus) {
  const column = kanbanColumnByStatus[status] ?? kanbanColumns[1];
  return { label: column.label, chipClassName: column.chipClass };
}
