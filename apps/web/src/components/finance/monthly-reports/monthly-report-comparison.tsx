import type { SpendComparison } from "@life/shared";
import { formatCadCents } from "@/lib/budget-money";
import { cn } from "@/lib/cn";

type MonthlyReportComparisonProps = {
  comparison: SpendComparison | null | undefined;
  className?: string;
};

function formatSignedCadCents(cents: number): string {
  const formatted = formatCadCents(Math.abs(cents));
  if (cents > 0) {
    return `+${formatted}`;
  }
  if (cents < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

export function MonthlyReportComparison({ comparison, className }: MonthlyReportComparisonProps) {
  if (!comparison) {
    return null;
  }

  const { deltaCents, deltaPercent } = comparison;

  return (
    <span className={cn("text-xs text-text-muted", className)}>
      {formatSignedCadCents(deltaCents)} ({deltaPercent > 0 ? "+" : ""}
      {deltaPercent}% vs last month)
    </span>
  );
}

export function toSpendComparison(
  deltaCents: number | null | undefined,
  deltaPercent: number | null | undefined,
): SpendComparison | null {
  if (deltaCents == null || deltaPercent == null) {
    return null;
  }

  return {
    deltaCents,
    deltaPercent,
  };
}
