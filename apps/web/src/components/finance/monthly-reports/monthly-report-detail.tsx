"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { BudgetMonthReportQuery } from "@/graphql";
import { BudgetProgressBar } from "@/components/finance/budget/budget-progress-bar";
import {
  MonthlyReportComparison,
  toSpendComparison,
} from "@/components/finance/monthly-reports/monthly-report-comparison";
import { formatShortDate } from "@life/shared/dates";
import { formatBudgetRemainingLabel, formatCadCents } from "@/lib/budget-money";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { cn } from "@/lib/cn";

type ReportSection = BudgetMonthReportQuery["budgetMonthReport"]["sections"][number];

type MonthlyReportDetailProps = {
  sections: ReportSection[];
  forceExpanded?: boolean;
};

export function MonthlyReportDetail({ sections, forceExpanded = false }: MonthlyReportDetailProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(sections.map((section) => section.id)));

  const isExpanded = (sectionId: string) => forceExpanded || expandedIds.has(sectionId);

  const toggleSection = (sectionId: string) => {
    if (forceExpanded) {
      return;
    }

    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-report-detail>
      <h2 className="text-sm font-semibold text-text-main">Detail</h2>

      {sections.map((section) => {
        const expanded = isExpanded(section.id);
        const sectionComparison = toSpendComparison(section.spentDeltaCents, section.spentDeltaPercent);

        return (
          <section key={section.id} className={sectionCardClass} data-report-section>
            <header className={cn(sectionHeaderClass, "flex flex-wrap items-center justify-between gap-2")}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                aria-expanded={expanded}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
                )}
                <span className="truncate text-sm font-semibold text-text-main">{section.name}</span>
              </button>

              <MonthlyReportComparison comparison={sectionComparison} className="shrink-0" />
            </header>

            {expanded ? (
              <div className="border-t border-border-subtle p-4">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-text-muted">
                        <th className="px-3 py-2 font-medium">Line item</th>
                        <th className="px-3 py-2 text-right font-medium">Budget</th>
                        <th className="px-3 py-2 text-right font-medium">Spent</th>
                        <th className="px-3 py-2 text-right font-medium">Remaining</th>
                        <th className="px-3 py-2 font-medium">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.lineItems.map((lineItem) => (
                        <LineItemGroup key={lineItem.id} lineItem={lineItem} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

type LineItem = ReportSection["lineItems"][number];

function LineItemGroup({ lineItem }: { lineItem: LineItem }) {
  return (
    <>
      <tr className="border-b border-border-subtle/70 bg-sage/10">
        <td className="px-3 py-2 font-medium text-text-main">{lineItem.name}</td>
        <td className="px-3 py-2 text-right tabular-nums text-text-main">
          {formatCadCents(lineItem.amountCents)}
        </td>
        <td className="px-3 py-2 text-right tabular-nums text-text-muted">
          {formatCadCents(lineItem.spentCents)}
        </td>
        <td
          className={cn(
            "px-3 py-2 text-right tabular-nums font-medium",
            lineItem.remainingCents < 0 ? "text-error" : "text-text-main",
          )}
        >
          {formatBudgetRemainingLabel(lineItem.amountCents, lineItem.spentCents)}
        </td>
        <td className="px-3 py-2">
          <BudgetProgressBar percent={lineItem.progressPercent} />
        </td>
      </tr>

      {lineItem.purchases.map((purchase) => (
        <tr key={purchase.id} className="border-b border-border-subtle/40 text-text-muted">
          <td className="px-3 py-1.5 pl-8">
            <span className="text-xs">{formatShortDate(purchase.purchaseDate)}</span>
            <span className="mx-2 text-border-subtle">·</span>
            <span className="text-sm text-text-main">{purchase.name}</span>
          </td>
          <td />
          <td className="px-3 py-1.5 text-right tabular-nums text-text-main">
            {formatCadCents(purchase.amountCents)}
          </td>
          <td />
          <td />
        </tr>
      ))}
    </>
  );
}
