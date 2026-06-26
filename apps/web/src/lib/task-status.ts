import type { TaskStatus } from "@/graphql";

export type KanbanColumn = {
  status: TaskStatus;
  label: string;
  dotClass: string;
  accentClass: string;
  collapsible?: boolean;
};

export const kanbanColumns: KanbanColumn[] = [
  {
    status: "BACKLOG",
    label: "Backlog",
    dotClass: "bg-status-backlog",
    accentClass: "border-t-status-backlog",
  },
  {
    status: "TODO",
    label: "Todo",
    dotClass: "bg-status-todo",
    accentClass: "border-t-status-todo",
  },
  {
    status: "IN_PROGRESS",
    label: "In progress",
    dotClass: "bg-status-in-progress",
    accentClass: "border-t-status-in-progress",
  },
  {
    status: "WAITING",
    label: "Waiting",
    dotClass: "bg-status-waiting",
    accentClass: "border-t-status-waiting",
  },
  {
    status: "DONE",
    label: "Done",
    dotClass: "bg-status-done",
    accentClass: "border-t-status-done",
    collapsible: true,
  },
];

export const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

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
  if (status === "DONE") {
    return "bg-status-done text-on-primary";
  }

  if (status === "IN_PROGRESS") {
    return "bg-muted-blue text-secondary";
  }

  if (status === "WAITING") {
    return "bg-warm-amber text-[#6b3800]";
  }

  if (status === "OVERDUE") {
    return "bg-error-container text-error";
  }

  return "bg-sage text-primary-container";
}
