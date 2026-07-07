"use client";

import type { PillSelectOption } from "@/components/ui/pill-select";
import { PillSelect } from "@/components/ui/pill-select";

type EditableSelectCellProps<T extends string> = {
  value: T;
  options: PillSelectOption<T>[];
  onSave: (value: T) => Promise<void>;
  disabled?: boolean;
};

export function EditableSelectCell<T extends string>({
  value,
  options,
  onSave,
  disabled = false,
}: EditableSelectCellProps<T>) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  if (disabled) {
    return <span className="text-sm text-text-muted">{selected?.label ?? value}</span>;
  }

  return (
    <PillSelect
      value={value}
      triggerLabel={selected?.label ?? value}
      triggerChipClassName={selected?.chipClassName ?? ""}
      options={options}
      onSelect={onSave}
    />
  );
}
