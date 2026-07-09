"use client";

import { useQuery } from "@apollo/client";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BudgetAllocationRow } from "@/components/finance/budget/budget-allocation-row";
import {
  useBudgetPurchases,
  type BudgetPurchasesTarget,
} from "@/components/finance/budget/budget-purchases-context";
import { BUDGET_LINE_ALLOCATIONS_QUERY } from "@/graphql";
import type { BudgetLineAllocationsQuery, BudgetLineAllocationsQueryVariables } from "@/graphql";
import { formatBudgetRemainingLabel, formatCadCents } from "@/lib/budget-money";
import { cn } from "@/lib/cn";

type BudgetPurchasesSidebarProps = {
  monthlyTitle: string;
  annualTitle: string;
};

const SIDEBAR_TRANSITION_MS = 300;

export function BudgetPurchasesSidebar({ monthlyTitle, annualTitle }: BudgetPurchasesSidebarProps) {
  const { activeLineItem, closePurchases } = useBudgetPurchases();
  const [heldLineItem, setHeldLineItem] = useState<BudgetPurchasesTarget | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const wasOpenRef = useRef(false);

  const panelLineItem = activeLineItem ?? heldLineItem;

  useEffect(() => {
    if (activeLineItem) {
      setHeldLineItem(activeLineItem);
      return;
    }

    const timer = window.setTimeout(() => setHeldLineItem(null), SIDEBAR_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [activeLineItem]);

  useEffect(() => {
    if (activeLineItem) {
      if (!wasOpenRef.current) {
        setIsVisible(false);
        const frame = requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsVisible(true));
        });
        wasOpenRef.current = true;
        return () => cancelAnimationFrame(frame);
      }
      return;
    }

    wasOpenRef.current = false;
    setIsVisible(false);
  }, [activeLineItem]);

  const { data, loading, refetch } = useQuery<
    BudgetLineAllocationsQuery,
    BudgetLineAllocationsQueryVariables
  >(BUDGET_LINE_ALLOCATIONS_QUERY, {
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

  const allocations = data?.budgetLineAllocations ?? [];
  const totalSpentCents = useMemo(
    () => allocations.reduce((sum, allocation) => sum + allocation.amountCents, 0),
    [allocations],
  );

  if (!panelLineItem) {
    return null;
  }

  const periodLabel = panelLineItem.scope === "MONTHLY" ? monthlyTitle : annualTitle;
  const spentCents = allocations.length > 0 ? totalSpentCents : panelLineItem.spentCents;
  const isOverBudget = spentCents > panelLineItem.amountCents;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close purchases"
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={closePurchases}
      />

      <aside
        className={cn(
          "relative flex h-full w-full max-w-2xl flex-col border-l border-border-subtle bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.12)]",
          "transition-transform duration-300 ease-out",
          isVisible ? "translate-x-0" : "translate-x-full",
        )}
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
      </aside>
    </div>
  );
}
