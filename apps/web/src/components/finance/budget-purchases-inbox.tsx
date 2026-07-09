"use client";

import { useMutation } from "@apollo/client";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import type { BudgetPurchase } from "@/components/finance/types";
import { BudgetPurchaseChip } from "@/components/finance/budget-purchase-chip";
import { BudgetPurchaseDraftRow } from "@/components/finance/budget-purchase-draft-row";
import { Button } from "@/components/ui/button";
import { DELETE_BUDGET_PURCHASE_MUTATION } from "@/graphql";
import { BUDGET_PAGE_REFETCH } from "@/lib/budget-queries";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { cn } from "@/lib/cn";

type BudgetPurchasesInboxProps = {
  purchases: BudgetPurchase[];
  budgetYear: number;
  budgetMonth: number;
};

export function BudgetPurchasesInbox({ purchases, budgetYear, budgetMonth }: BudgetPurchasesInboxProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [deletePurchase] = useMutation(DELETE_BUDGET_PURCHASE_MUTATION, {
    refetchQueries: [...BUDGET_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });

  return (
    <section className={sectionCardClass}>
      <header
        className={cn(
          sectionHeaderClass,
          "flex cursor-pointer select-none items-center justify-between gap-2",
        )}
        onClick={() => setCollapsed((current) => !current)}
      >
        <div className="flex min-w-0 items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">
              Purchases inbox
            </h2>
            {!collapsed ? (
              <p className="text-xs text-text-muted">
                Drag purchases onto monthly or annual budget lines to allocate spend.
              </p>
            ) : null}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
            purchases.length > 0
              ? "min-w-6 bg-primary text-center text-white shadow-sm"
              : "bg-background text-text-muted",
          )}
        >
          {purchases.length}
        </span>
      </header>

      {!collapsed ? (
        <div className="space-y-3 p-3">
          {notice ? (
            <p className="rounded-md border border-muted-blue/40 bg-muted-blue/10 px-3 py-2 text-sm text-text-main">
              {notice}
            </p>
          ) : null}

          {purchases.length === 0 && !adding ? (
            <p className="text-sm text-text-muted">
              No unassigned purchases. Add one below or remove an assignment from a budget line.
            </p>
          ) : (
            <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {purchases.map((purchase) => (
                <li key={purchase.id}>
                  <BudgetPurchaseChip
                    purchase={purchase}
                    deleting={deletingId === purchase.id}
                    onDelete={() => {
                      setDeletingId(purchase.id);
                      void deletePurchase({ variables: { id: purchase.id } }).finally(() =>
                        setDeletingId(null),
                      );
                    }}
                  />
                </li>
              ))}
            </ul>
          )}

          {adding ? (
            <BudgetPurchaseDraftRow
              budgetYear={budgetYear}
              budgetMonth={budgetMonth}
              onCreated={(createdNotice) => {
                setAdding(false);
                setNotice(createdNotice);
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={() => {
                setNotice(null);
                setAdding(true);
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add purchase
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );
}
