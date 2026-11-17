import {
  SHOPPING_URGENCIES,
  SHOPPING_URGENCY_LABELS,
  type ShoppingUrgency,
} from "@life/shared";

type UrgencyOption = {
  value: ShoppingUrgency;
  label: string;
  chipClassName: string;
};

export const urgencyLabels: Record<ShoppingUrgency, string> = { ...SHOPPING_URGENCY_LABELS };

const URGENCY_CHIP_CLASSES: Record<ShoppingUrgency, string> = {
  LOW: "bg-status-done text-on-primary",
  MEDIUM: "bg-[#d4a017] text-on-primary",
  HIGH: "bg-error text-on-primary",
};

export function urgencyChipClass(urgency: string) {
  return URGENCY_CHIP_CLASSES[urgency as ShoppingUrgency] ?? URGENCY_CHIP_CLASSES.MEDIUM;
}

export function urgencySelectOptions(): UrgencyOption[] {
  return SHOPPING_URGENCIES.map((urgency) => ({
    value: urgency,
    label: urgencyLabels[urgency],
    chipClassName: urgencyChipClass(urgency),
  }));
}
