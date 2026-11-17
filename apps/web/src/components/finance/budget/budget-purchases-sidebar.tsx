"use client";

import { useQuery } from "@apollo/client";
import { X } from "lucide-react";
import { useEffect } from "react";
import { BudgetAllocationRow } from "@/components/finance/budget/budget-allocation-row";
import { useBudgetPurchases } from "@/components/finance/budget/budget-purchases-context";
import { SlideOverPanel, useSlideOverPresence } from "@/components/ui/slide-over-panel";
import { BudgetLineAllocationsDocument } from "@/graphql";
import type { BudgetLineAllocationsQuery, BudgetLineAllocationsQueryVariables } from "@/graphql";
import { formatBudgetRemainingLabel, formatCadCents } from "@life/shared";
import { cn } from "@/lib/cn";

type BudgetPurchasesSidebarProps = {
  monthlyTitle: string;
  annualTitle: string;
};

export function BudgetPurchasesSidebar({ monthlyTitle, annualTitle }: BudgetPurchasesSidebarProps) {
  const { activeLineItem, closePurchases } = useBudgetPurchases();
  const { panelItem: panelLineItem, isVisible } = useSlideOverPresence(activeLineItem);

  const { data, loading, refetch } = useQuery<
    BudgetLineAllocationsQuery,
    BudgetLineAllocationsQueryVariables
  >(BudgetLineAllocationsDocument, {
    skip: !panelLineItem,
    variables: { lineItemId: panelLineItem?.id ?? "" },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!activeLineItem) {
      return;
    }
    void refetch();
  }, [activeLineItem, refetch]);

  if (!panelLineItem) {
    return null;
  }

  const allocations = data?.budgetLineAllocations ?? [];
  const periodLabel = panelLineItem.scope === "MONTHLY" ? monthlyTitle : annualTitle;
  const spentCents =
    allocations.length > 0
      ? allocations.reduce((sum, allocation) => sum + allocation.amountCents, 0)
      : panelLineItem.spentCents;
  const isOverBudget = spentCents > panelLineItem.amountCents;

  return (
    <SlideOverPanel
      isVisible={isVisible}
      onClose={closePurchases}
      closeLabel="Close purchases"
      className="max-w-2xl"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Purchases · {periodLabel}
          </p>
          <h2 className="truncate text-lg font-semibold text-text-main">{panelLineItem.name}</h2>
          <p className="mt-1 text-sm tabular-nums text-text-muted">
            Budget {formatCadCents(panelLineItem.amountCents)}
          </p>
          <p className={cn("text-sm tabular-nums", isOverBudget ? "text-error" : "text-text-muted")}>
            {isOverBudget
              ? formatBudgetRemainingLabel(panelLineItem.amountCents, spentCents)
              : `${formatBudgetRemainingLabel(panelLineItem.amountCents, spentCents)} remaining`}
          </p>
        </div>
        <button
          type="button"
          onClick={closePurchases}
          className="rounded-lg p-1 text-text-muted hover:bg-background"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {loading && allocations.length === 0 ? (
          <p className="text-sm text-text-muted">Loading purchases…</p>
        ) : allocations.length === 0 ? (
          <p className="text-sm text-text-muted">
            No purchases allocated to this line yet. Drag from the inbox to assign spend.
          </p>
        ) : (
          <table className="min-w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[46%]" />
              <col className="w-[22%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
                <th className="px-3 py-2 text-right font-semibold">Date</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation) => (
                <BudgetAllocationRow
                  key={allocation.id}
                  allocation={allocation}
                  onUpdated={async () => {
                    await refetch();
                  }}
                />
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border-subtle bg-sage/20 text-text-main">
              <tr>
                <td className="px-3 py-2.5 font-semibold">Total spent</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                  {formatCadCents(spentCents)}
                </td>
                <td className="px-3 py-2.5" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </SlideOverPanel>
  );
}
