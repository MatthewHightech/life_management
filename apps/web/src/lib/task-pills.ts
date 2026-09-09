import { toggleAssigneeId, type TaskPriority, type TaskStatus } from "@life/shared";
import {
  kanbanColumns,
  priorityChipClass,
  priorityLabels,
  statusChipClass,
  statusLabel,
  taskPriorities,
} from "@/lib/task-status";

export { toggleAssigneeId };

type TaskPillOption<T extends string> = {
  value: T;
  label: string;
  chipClassName: string;
};

export function statusSelectOptions(): TaskPillOption<TaskStatus>[] {
  return kanbanColumns.map((column) => ({
    value: column.status,
    label: column.label,
    chipClassName: column.chipClass,
  }));
}

export function prioritySelectOptions(): TaskPillOption<TaskPriority>[] {
  return taskPriorities.map((priority) => ({
    value: priority,
    label: priorityLabels[priority],
    chipClassName: priorityChipClass(priority),
  }));
}

export function statusTriggerDisplay(status: TaskStatus) {
  const column = kanbanColumns.find((item) => item.status === status);

  return {
    label: column?.label ?? statusLabel(status),
    chipClassName: column?.chipClass ?? statusChipClass(status),
  };
}
