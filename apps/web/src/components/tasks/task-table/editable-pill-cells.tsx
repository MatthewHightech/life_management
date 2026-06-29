"use client";

import type { TaskPriority, TaskStatus } from "@/graphql";
import { PillSelect } from "@/components/ui/pill-select";
import { priorityLabels, priorityChipClass } from "@/lib/task-status";
import {
  prioritySelectOptions,
  statusSelectOptions,
  statusTriggerDisplay,
} from "@/lib/task-pills";

type EditableStatusProps = {
  value: TaskStatus;
  onSave: (value: TaskStatus) => Promise<void>;
};

export function EditableStatus({ value, onSave }: EditableStatusProps) {
  const trigger = statusTriggerDisplay(value);

  return (
    <PillSelect
      value={value}
      triggerLabel={trigger.label}
      triggerChipClassName={trigger.chipClassName}
      options={statusSelectOptions()}
      onSelect={onSave}
    />
  );
}

type EditablePriorityProps = {
  value: TaskPriority;
  onSave: (value: TaskPriority) => Promise<void>;
  triggerClassName?: string;
  chipClassName?: string;
};

export function EditablePriority({ value, onSave, triggerClassName, chipClassName }: EditablePriorityProps) {
  return (
    <PillSelect
      value={value}
      triggerLabel={priorityLabels[value]}
      triggerChipClassName={priorityChipClass(value)}
      options={prioritySelectOptions()}
      onSelect={onSave}
      triggerClassName={triggerClassName}
      chipClassName={chipClassName}
    />
  );
}
