"use client";

import { useQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  formatBudgetReportEmptyMessage,
  getBudgetCalendarPeriod,
  previousBudgetYearMonth,
} from "@life/shared";
import { FinancePageLayout } from "@/components/finance/finance-page-layout";
import { MonthlyReportDetail } from "@/components/finance/monthly-reports/monthly-report-detail";
import { MonthlyReportOverview } from "@/components/finance/monthly-reports/monthly-report-overview";
import { useMonthlyReportPdf } from "@/components/finance/monthly-reports/use-monthly-report-pdf";
import { Button } from "@/components/ui/button";
import { BUDGET_MONTH_REPORT_QUERY, type BudgetMonthReportQuery } from "@/graphql";
import { cn } from "@/lib/cn";

export function MonthlyReportsPage() {
  const currentPeriod = useMemo(() => getBudgetCalendarPeriod(), []);
  const [year, setYear] = useState(currentPeriod.year);
  const [month, setMonth] = useState(currentPeriod.month);
  const [pdfCapture, setPdfCapture] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const isCurrentMonth = year === currentPeriod.year && month === currentPeriod.month;

  const { data, loading, error } = useQuery<BudgetMonthReportQuery>(BUDGET_MONTH_REPORT_QUERY, {
    variables: { year, month },
  });

  const report = data?.budgetMonthReport;
  const title = report?.title ?? `${month}/${year}`;
  const { downloadPdf, downloading } = useMonthlyReportPdf(`${title} Financial Report`);

  const goToPreviousMonth = () => {
    const previous = previousBudgetYearMonth(year, month);
    setYear(previous.year);
    setMonth(previous.month);
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) {
      return;
    }

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    setYear(nextYear);
    setMonth(nextMonth);
  };

  const handleDownloadPdf = async () => {
    setPdfCapture(true);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    await downloadPdf(reportRef.current);
    setPdfCapture(false);
  };

  return (
    <FinancePageLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="rounded-lg border border-border-subtle p-2 text-text-muted hover:bg-surface hover:text-text-main"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <h2 className="min-w-[10rem] text-center text-lg font-semibold text-text-main">{title}</h2>

            <button
              type="button"
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
              className={cn(
                "rounded-lg border border-border-subtle p-2 text-text-muted hover:bg-surface hover:text-text-main",
                isCurrentMonth && "cursor-not-allowed opacity-40",
              )}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {report?.hasReport ? (
            <Button
              type="button"
              variant="secondary"
              className="gap-1.5 px-3 py-1.5 text-xs"
              disabled={downloading}
              onClick={() => void handleDownloadPdf()}
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing PDF…" : "Download PDF"}
            </Button>
          ) : null}
        </div>

        {loading ? <p className="text-sm text-text-muted">Loading report…</p> : null}
        {error ? <p className="text-sm text-error">Could not load report.</p> : null}

        {!loading && !error && report && !report.hasReport ? (
          <div className="rounded-xl border border-border-subtle bg-surface px-6 py-16 text-center">
            <p className="text-sm text-text-muted">{formatBudgetReportEmptyMessage(year, month)}</p>
          </div>
        ) : null}

        {!loading && !error && report?.hasReport ? (
          <div ref={reportRef} className="space-y-4 bg-background">
            <MonthlyReportOverview report={report} />
            <MonthlyReportDetail sections={report.sections} forceExpanded={pdfCapture} />
          </div>
        ) : null}
      </div>
    </FinancePageLayout>
  );
}
