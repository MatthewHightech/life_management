import type { GearCondition } from "@/components/gear/types";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";

const LABELS: Record<GearCondition, string> = {
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
  RETIRED: "Retired",
};

const STYLES: Record<GearCondition, string> = {
  LIKE_NEW: "bg-sky/30 text-text-main",
  GOOD: "bg-sage-green/50 text-text-main",
  FAIR: "bg-warm-amber/40 text-text-main",
  RETIRED: "bg-background text-text-muted line-through",
};

type GearConditionChipProps = {
  condition: GearCondition;
  className?: string;
};

export function GearConditionChip({ condition, className }: GearConditionChipProps) {
  return (
    <Chip className={cn(STYLES[condition], className)}>{LABELS[condition]}</Chip>
  );
}

export const GEAR_CONDITION_OPTIONS: { value: GearCondition; label: string }[] = [
  { value: "LIKE_NEW", label: LABELS.LIKE_NEW },
  { value: "GOOD", label: LABELS.GOOD },
  { value: "FAIR", label: LABELS.FAIR },
  { value: "RETIRED", label: LABELS.RETIRED },
];
