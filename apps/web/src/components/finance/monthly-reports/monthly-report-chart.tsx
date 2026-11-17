import { formatCadCents } from "@life/shared";
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

const SEGMENTS = [
  { label: "Spent", className: "bg-status-in-progress" },
  { label: "Remaining budget", className: "bg-[#c5dbc8]" },
  { label: "Over budget", className: "bg-error" },
] as const;

function segmentCents({ budgetCents, spentCents }: ReportSectionChart) {
  return [
    Math.min(spentCents, budgetCents),
    Math.max(budgetCents - spentCents, 0),
    Math.max(spentCents - budgetCents, 0),
  ];
}

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
          {SEGMENTS.map((segment) => (
            <span key={segment.label} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", segment.className)} aria-hidden />
              {segment.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {chartSections.map((section) => {
          const stackTotal = Math.max(section.budgetCents, section.spentCents);
          const cents = segmentCents(section);

          return (
            <div key={section.id} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
              <span className="truncate text-sm text-text-main">{section.name}</span>
              <div className="flex h-3 min-w-0 items-center">
                <div
                  className="flex h-full overflow-hidden rounded-full"
                  style={{ width: `${(stackTotal / maxCents) * 100}%` }}
                >
                  {SEGMENTS.map((segment, index) =>
                    cents[index] > 0 ? (
                      <div
                        key={segment.label}
                        className={cn("h-full", segment.className)}
                        style={{ width: `${(cents[index] / stackTotal) * 100}%` }}
                      />
                    ) : null,
                  )}
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
