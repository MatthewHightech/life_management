"use client";

import { PillSelect } from "@/components/ui/pill-select";
import type { ShoppingUrgency } from "@/graphql";
import { urgencyChipClass, urgencyLabels, urgencySelectOptions } from "@/lib/shopping-urgency";

type EditableUrgencyProps = {
  value: ShoppingUrgency;
  onSave: (value: ShoppingUrgency) => Promise<void> | void;
};

export function EditableUrgency({ value, onSave }: EditableUrgencyProps) {
  return (
    <PillSelect
      value={value}
      triggerLabel={`Urgency: ${urgencyLabels[value]}`}
      triggerChipClassName={urgencyChipClass(value)}
      options={urgencySelectOptions()}
      onSelect={onSave}
      hideLabel
    />
  );
}
