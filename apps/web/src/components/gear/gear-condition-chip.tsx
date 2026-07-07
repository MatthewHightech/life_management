import type { GearCondition } from "@/components/gear/types";
import {
  GEAR_CONDITION_CHIP_STYLES,
  GEAR_CONDITION_LABELS,
} from "@/components/gear/gear-condition-select";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";

type GearConditionChipProps = {
  condition: GearCondition;
  className?: string;
};

export function GearConditionChip({ condition, className }: GearConditionChipProps) {
  return (
    <Chip
      className={cn(
        GEAR_CONDITION_CHIP_STYLES[condition],
        condition === "RETIRED" && "line-through",
        className,
      )}
    >
      {GEAR_CONDITION_LABELS[condition]}
    </Chip>
  );
}

export const GEAR_CONDITION_OPTIONS: { value: GearCondition; label: string }[] = (
  ["LIKE_NEW", "GOOD", "FAIR", "RETIRED"] as const
).map((value) => ({
  value,
  label: GEAR_CONDITION_LABELS[value],
}));
