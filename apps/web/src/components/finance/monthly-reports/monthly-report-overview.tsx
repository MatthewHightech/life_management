import type { BudgetMonthReportQuery } from "@/graphql";
import { MonthlyReportChart } from "@/components/finance/monthly-reports/monthly-report-chart";
import {
  MonthlyReportComparison,
  toSpendComparison,
} from "@/components/finance/monthly-reports/monthly-report-comparison";
import { formatBudgetRemainingLabel, formatCadCents } from "@/lib/budget-money";
import { sectionCardClass } from "@/lib/section-header";
import { cn } from "@/lib/cn";

type MonthlyReportOverviewProps = {
  report: BudgetMonthReportQuery["budgetMonthReport"];
};

export function MonthlyReportOverview({ report }: MonthlyReportOverviewProps) {
  const totalComparison = toSpendComparison(
    report.comparison?.spentDeltaCents,
    report.comparison?.spentDeltaPercent,
  );

  return (
    <section className={sectionCardClass}>
      <div className="space-y-5 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <OverviewStat label="Budget" value={formatCadCents(report.budgetCents)} />
          <OverviewStat label="Spent" value={formatCadCents(report.spentCents)}>
            <MonthlyReportComparison comparison={totalComparison} />
          </OverviewStat>
          <OverviewStat
            label="Remaining"
            value={formatBudgetRemainingLabel(report.budgetCents, report.spentCents)}
            valueClassName={report.remainingCents < 0 ? "text-error" : undefined}
          />
        </div>

        {report.overBudgetSectionNames.length > 0 ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm">
            <span className="font-medium text-error">Over budget:</span>{" "}
            <span className="text-text-main">{report.overBudgetSectionNames.join(", ")}</span>
          </div>
        ) : null}

        <MonthlyReportChart sections={report.sections} />
      </div>
    </section>
  );
}

type OverviewStatProps = {
  label: string;
  value: string;
  valueClassName?: string;
  children?: React.ReactNode;
};

function OverviewStat({ label, value, valueClassName, children }: OverviewStatProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums text-text-main", valueClassName)}>{value}</p>
      {children ? <div className="mt-1">{children}</div> : null}
    </div>
  );
}
