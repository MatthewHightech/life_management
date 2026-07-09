"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseBudgetLineDropId, parseBudgetPurchaseDragId } from "@life/shared";
import type { BudgetMonthQuery } from "@/graphql";
import { ALLOCATE_BUDGET_PURCHASE_MUTATION, BUDGET_MONTH_QUERY } from "@/graphql";
import {
  BUDGET_TABLE_CONFIGS,
  budgetSectionsForScope,
  budgetTitleForScope,
  type BudgetScope,
} from "@/components/finance/budget/budget-scope";
import { BudgetPurchaseChip } from "@/components/finance/budget/budget-purchase-chip";
import { BudgetPurchasesInbox } from "@/components/finance/budget/budget-purchases-inbox";
import { BudgetPurchasesProvider } from "@/components/finance/budget/budget-purchases-context";
import { BudgetPurchasesSidebar } from "@/components/finance/budget/budget-purchases-sidebar";
import { BudgetSectionFormModal } from "@/components/finance/budget/budget-section-form-modal";
import { BudgetTable } from "@/components/finance/budget/budget-table";
import type { BudgetPurchase } from "@/components/finance/budget/types";
import { FinancePageLayout } from "@/components/finance/finance-page-layout";
import { BUDGET_LINE_ALLOCATIONS_REFETCH } from "@/lib/budget-queries";

function BudgetPageContent() {
  const [sectionModalScope, setSectionModalScope] = useState<BudgetScope | null>(null);
  const [dragPreview, setDragPreview] = useState<BudgetPurchase | null>(null);
  const [hiddenPurchaseIds, setHiddenPurchaseIds] = useState<Set<string>>(() => new Set());
  const { data, loading, error } = useQuery<BudgetMonthQuery>(BUDGET_MONTH_QUERY);

  const mutationOptions = {
    refetchQueries: [...BUDGET_LINE_ALLOCATIONS_REFETCH],
    awaitRefetchQueries: true,
  };

  const [allocatePurchase] = useMutation(ALLOCATE_BUDGET_PURCHASE_MUTATION, mutationOptions);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const purchaseById = useMemo(
    () => new Map(data?.budgetMonth.purchases.map((purchase) => [purchase.id, purchase]) ?? []),
    [data?.budgetMonth.purchases],
  );

  const inboxPurchases = useMemo(
    () =>
      (data?.budgetMonth.purchases ?? []).filter((purchase) => !hiddenPurchaseIds.has(purchase.id)),
    [data?.budgetMonth.purchases, hiddenPurchaseIds],
  );

  useEffect(() => {
    const inboxIds = new Set(data?.budgetMonth.purchases.map((purchase) => purchase.id) ?? []);
    setHiddenPurchaseIds((current) => {
      if (current.size === 0) {
        return current;
      }

      const next = new Set([...current].filter((id) => inboxIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [data?.budgetMonth.purchases]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const purchaseId = parseBudgetPurchaseDragId(String(event.active.id));
      if (!purchaseId) {
        return;
      }

      const purchase = purchaseById.get(purchaseId);
      if (purchase) {
        setDragPreview(purchase);
      }
    },
    [purchaseById],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const lineItemId = over ? parseBudgetLineDropId(String(over.id)) : undefined;
      const purchaseId = parseBudgetPurchaseDragId(String(active.id));

      if (lineItemId && purchaseId) {
        setHiddenPurchaseIds((current) => new Set(current).add(purchaseId));
        void allocatePurchase({ variables: { purchaseId, lineItemId } }).catch(() => {
          setHiddenPurchaseIds((current) => {
            const next = new Set(current);
            next.delete(purchaseId);
            return next;
          });
        });
      }

      setDragPreview(null);
    },
    [allocatePurchase],
  );

  return (
    <FinancePageLayout>
      {loading && <p className="text-sm text-text-muted">Loading budget…</p>}
      {error && <p className="text-sm text-error">Could not load budget: {error.message}</p>}

      {!loading && !error && data?.budgetMonth ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            <BudgetPurchasesInbox
              purchases={inboxPurchases}
              budgetYear={data.budgetMonth.year}
              budgetMonth={data.budgetMonth.month}
            />

            {BUDGET_TABLE_CONFIGS.map((config) => (
              <BudgetTable
                key={config.scope}
                scope={config.scope}
                title={budgetTitleForScope(data.budgetMonth, config.scope)}
                sections={budgetSectionsForScope(data.budgetMonth, config.scope)}
                collapsible={config.collapsible}
                defaultCollapsed={config.defaultCollapsed}
                emptyMessage={config.emptyMessage}
                onAddSection={() => setSectionModalScope(config.scope)}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {dragPreview ? <BudgetPurchaseChip purchase={dragPreview} overlay /> : null}
          </DragOverlay>
        </DndContext>
      ) : null}

      {data?.budgetMonth ? (
        <BudgetPurchasesSidebar
          monthlyTitle={data.budgetMonth.title}
          annualTitle={data.budgetMonth.annualTitle}
        />
      ) : null}

      <BudgetSectionFormModal
        open={sectionModalScope !== null}
        scope={sectionModalScope ?? "MONTHLY"}
        onOpenChange={(open) => {
          if (!open) {
            setSectionModalScope(null);
          }
        }}
      />
    </FinancePageLayout>
  );
}

export function BudgetPage() {
  return (
    <BudgetPurchasesProvider>
      <BudgetPageContent />
    </BudgetPurchasesProvider>
  );
}
