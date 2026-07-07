import type { GearCondition } from "@/components/gear/types";
import type { PillSelectOption } from "@/components/ui/pill-select";

export const GEAR_CONDITION_LABELS: Record<GearCondition, string> = {
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
  RETIRED: "Retired",
};

/** Pastel chips: green (best) → yellow → orange → red (retired). */
export const GEAR_CONDITION_CHIP_STYLES: Record<GearCondition, string> = {
  LIKE_NEW: "bg-status-done/25 text-status-done",
  GOOD: "bg-status-in-progress/30 text-[#8a6418]",
  FAIR: "bg-status-waiting/25 text-status-waiting",
  RETIRED: "bg-error-container text-error",
};

export const gearConditionSelectOptions: PillSelectOption<GearCondition>[] = (
  ["LIKE_NEW", "GOOD", "FAIR", "RETIRED"] as const
).map((value) => ({
  value,
  label: GEAR_CONDITION_LABELS[value],
  chipClassName: GEAR_CONDITION_CHIP_STYLES[value],
}));
