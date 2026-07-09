"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { BudgetScope } from "@/components/finance/budget/budget-scope";
import type { BudgetSection } from "@/components/finance/budget/types";
import { BudgetSectionRow } from "@/components/finance/budget/budget-section-row";
import { BudgetProgressBar } from "@/components/finance/budget/budget-progress-bar";
import { Button } from "@/components/ui/button";
import { formatBudgetRemainingLabel, formatCadCents } from "@/lib/budget-money";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { budgetRemainingCents, budgetRemainingPercent } from "@life/shared";
import { cn } from "@/lib/cn";

type BudgetTableProps = {
  title: string;
  sections: BudgetSection[];
  scope: BudgetScope;
  onAddSection: () => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  emptyMessage?: string;
};

export function BudgetTable({
  title,
  sections,
  scope,
  onAddSection,
  collapsible = false,
  defaultCollapsed = false,
  emptyMessage = "Add a section to start building your budget.",
}: BudgetTableProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedBySection, setExpandedBySection] = useState<Record<string, boolean>>({});
  const [addingItemSectionId, setAddingItemSectionId] = useState<string | null>(null);

  function isExpanded(sectionId: string) {
    return expandedBySection[sectionId] ?? true;
  }

  const totals = useMemo(() => {
    let budgetCents = 0;
    let spentCents = 0;

    for (const section of sections) {
      budgetCents += section.budgetCents;
      spentCents += section.spentCents;
    }

    const remainingCents = budgetRemainingCents(budgetCents, spentCents);

    return {
      budgetCents,
      spentCents,
      remainingCents,
      progressPercent: budgetRemainingPercent(spentCents, budgetCents),
    };
  }, [sections]);

  const tableContent =
    sections.length === 0 ? (
      <p className="text-sm text-text-muted">{emptyMessage}</p>
    ) : (
      <table className="min-w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[38%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
          <col className="w-[15%]" />
          <col className="w-[8%]" />
        </colgroup>
        <thead className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
          <tr>
            <th className="px-3 py-2 font-semibold">Name</th>
            <th className="px-3 py-2 text-right font-semibold">Budget</th>
            <th className="px-3 py-2 text-right font-semibold">Spent</th>
            <th className="px-3 py-2 text-right font-semibold">Remaining</th>
            <th className="px-3 py-2 font-semibold">Progress</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <BudgetSectionRow
              key={section.id}
              section={section}
              scope={scope}
              expanded={isExpanded(section.id)}
              isAddingItem={addingItemSectionId === section.id}
              onToggleExpanded={() =>
                setExpandedBySection((current) => ({
                  ...current,
                  [section.id]: !isExpanded(section.id),
                }))
              }
              onAddItem={() => {
                setExpandedBySection((current) => ({ ...current, [section.id]: true }));
                setAddingItemSectionId(section.id);
              }}
              onCancelAddItem={() => setAddingItemSectionId(null)}
            />
          ))}
        </tbody>
        <tfoot className="border-t-2 border-border-subtle bg-sage/20 text-text-main">
          <tr>
            <td className="px-3 py-2.5 font-semibold">Total</td>
            <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
              {formatCadCents(totals.budgetCents)}
            </td>
            <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
              {formatCadCents(totals.spentCents)}
            </td>
            <td
              className={cn(
                "px-3 py-2.5 text-right tabular-nums font-semibold",
                totals.remainingCents < 0 ? "text-error" : undefined,
              )}
            >
              {formatBudgetRemainingLabel(totals.budgetCents, totals.spentCents)}
            </td>
            <td className="px-3 py-2.5">
              <BudgetProgressBar percent={totals.progressPercent} />
            </td>
            <td className="px-3 py-2.5" />
          </tr>
        </tfoot>
      </table>
    );

  return (
    <section className={sectionCardClass}>
      <header
        className={cn(
          sectionHeaderClass,
          "flex flex-wrap items-center justify-between gap-2",
          collapsible && "cursor-pointer select-none",
        )}
        onClick={collapsible ? () => setCollapsed((current) => !current) : undefined}
      >
        <div className="flex min-w-0 items-center gap-2">
          {collapsible ? (
            collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
            )
          ) : null}
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">{title}</h2>
        </div>
        {!collapsed ? (
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={(event) => {
              event.stopPropagation();
              onAddSection();
            }}
          >
            Add section
          </Button>
        ) : null}
      </header>

      {!collapsed ? <div className="overflow-x-auto p-3">{tableContent}</div> : null}
    </section>
  );
}
