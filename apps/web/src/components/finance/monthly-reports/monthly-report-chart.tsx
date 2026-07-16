import { formatCadCents } from "@/lib/budget-money";
import { cn } from "@/lib/cn";

type ReportSectionChart = {
  id: string;
  name: string;
  budgetCents: number;
  spentCents: number;
};

type MonthlyReportChartProps = {
  sections: ReportSectionChart[];
  className?: string;
};

/** Marigold yellow — spent fill */
const SPENT_BAR = "bg-status-in-progress";
/** Soft green — remaining budget fill */
const REMAINING_BAR = "bg-[#c5dbc8]";
/** Over budget fill */
const OVER_BAR = "bg-error";

export function MonthlyReportChart({ sections, className }: MonthlyReportChartProps) {
  const chartSections = sections.filter((section) => section.budgetCents > 0 || section.spentCents > 0);

  if (chartSections.length === 0) {
    return null;
  }

  const maxCents = Math.max(
    ...chartSections.map((section) => Math.max(section.budgetCents, section.spentCents)),
    1,
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
        <span className="font-medium text-text-main">Spend by section</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm", SPENT_BAR)} aria-hidden />
            Spent
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm", REMAINING_BAR)} aria-hidden />
            Remaining budget
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm", OVER_BAR)} aria-hidden />
            Over budget
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {chartSections.map((section) => {
          const barWidthPercent = (Math.max(section.budgetCents, section.spentCents) / maxCents) * 100;
          const spentWithinBudget = Math.min(section.spentCents, section.budgetCents);
          const spentOverBudget = Math.max(section.spentCents - section.budgetCents, 0);
          const remainingBudget = Math.max(section.budgetCents - section.spentCents, 0);
          const stackTotal = Math.max(section.budgetCents, section.spentCents);
          const spentWidthPercent = stackTotal > 0 ? (spentWithinBudget / stackTotal) * 100 : 0;
          const overWidthPercent = stackTotal > 0 ? (spentOverBudget / stackTotal) * 100 : 0;
          const remainingWidthPercent = stackTotal > 0 ? (remainingBudget / stackTotal) * 100 : 0;

          return (
            <div key={section.id} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
              <span className="truncate text-sm text-text-main">{section.name}</span>
              <div className="flex h-3 min-w-0 items-center">
                <div
                  className="flex h-full overflow-hidden rounded-full"
                  style={{ width: `${barWidthPercent}%` }}
                >
                  {spentWithinBudget > 0 ? (
                    <div className={cn("h-full", SPENT_BAR)} style={{ width: `${spentWidthPercent}%` }} />
                  ) : null}
                  {remainingBudget > 0 ? (
                    <div className={cn("h-full", REMAINING_BAR)} style={{ width: `${remainingWidthPercent}%` }} />
                  ) : null}
                  {spentOverBudget > 0 ? (
                    <div className={cn("h-full", OVER_BAR)} style={{ width: `${overWidthPercent}%` }} />
                  ) : null}
                </div>
              </div>
              <span className="text-right text-xs tabular-nums text-text-muted">
                {formatCadCents(section.spentCents)}
                {section.budgetCents > 0 ? ` / ${formatCadCents(section.budgetCents)}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
