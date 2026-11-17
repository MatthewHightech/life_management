"use client";

import type { TaskStatus } from "@/graphql";
import { PillSelect } from "@/components/ui/pill-select";
import {
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
