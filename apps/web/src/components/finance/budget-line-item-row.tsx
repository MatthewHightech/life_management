"use client";

import { useMutation } from "@apollo/client";
import { useDroppable } from "@dnd-kit/core";
import { PanelRightOpen, Trash2 } from "lucide-react";
import { budgetLineDropId } from "@life/shared";
import { useState } from "react";
import type { BudgetLineItem } from "@/components/finance/types";
import type { BudgetScope } from "@/components/finance/budget-scope";
import { useBudgetPurchases } from "@/components/finance/budget-purchases-context";
import { BudgetAmountCell } from "@/components/finance/budget-amount-cell";
import { BudgetProgressBar } from "@/components/finance/budget-progress-bar";
import { EditableTextCell } from "@/components/editable-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { formatBudgetRemainingLabel, formatCadCents } from "@/lib/budget-money";
import { BUDGET_PAGE_REFETCH } from "@/lib/budget-queries";
import {
  DELETE_BUDGET_LINE_ITEM_MUTATION,
  UPDATE_BUDGET_LINE_ITEM_MUTATION,
} from "@/graphql";
import { cn } from "@/lib/cn";

type BudgetLineItemRowProps = {
  item: BudgetLineItem;
  scope: BudgetScope;
};

export function BudgetLineItemRow({ item, scope }: BudgetLineItemRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { openPurchases } = useBudgetPurchases();
  const mutationOptions = { refetchQueries: [...BUDGET_PAGE_REFETCH], awaitRefetchQueries: true };

  const [updateLineItem] = useMutation(UPDATE_BUDGET_LINE_ITEM_MUTATION, mutationOptions);
  const [deleteLineItem, { loading: deleting }] = useMutation(DELETE_BUDGET_LINE_ITEM_MUTATION, {
    ...mutationOptions,
    onCompleted: () => setConfirmOpen(false),
  });

  const { setNodeRef, isOver } = useDroppable({
    id: budgetLineDropId(item.id),
  });

  const isOverBudget = item.remainingCents < 0;

  return (
    <>
      <tr
        ref={setNodeRef}
        className={cn(
          "border-b border-border-subtle transition-colors",
          isOver
            ? "bg-muted-blue/30 [&>td]:bg-muted-blue/30 [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-primary [&>td:first-child]:pl-[calc(2.5rem-4px)]"
            : "bg-surface/60",
        )}
      >
        <td className="max-w-0 overflow-hidden px-3 py-1.5 pl-10">
          <EditableTextCell
            value={item.name}
            wrap
            onSave={async (name) => {
              await updateLineItem({ variables: { id: item.id, input: { name } } });
            }}
            className="text-sm text-text-main"
          />
        </td>
        <td className="px-3 py-1.5 text-right">
          <BudgetAmountCell
            valueCents={item.amountCents}
            onSave={async (amountCents) => {
              await updateLineItem({ variables: { id: item.id, input: { amountCents } } });
            }}
          />
        </td>
        <td className="px-3 py-1.5 text-right tabular-nums text-text-muted">
          {formatCadCents(item.spentCents)}
        </td>
        <td
          className={cn(
            "px-3 py-1.5 text-right tabular-nums",
            isOverBudget ? "text-error" : "text-text-main",
          )}
        >
          {formatBudgetRemainingLabel(item.amountCents, item.spentCents)}
        </td>
        <td className="px-3 py-1.5">
          <BudgetProgressBar percent={item.progressPercent} />
        </td>
        <td className="px-3 py-1.5 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() =>
                openPurchases({
                  id: item.id,
                  name: item.name,
                  amountCents: item.amountCents,
                  spentCents: item.spentCents,
                  scope,
                })
              }
              className="rounded p-1 text-text-muted hover:bg-background hover:text-text-main"
              aria-label={`View purchases for ${item.name}`}
            >
              <PanelRightOpen className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded p-1 text-text-muted hover:bg-background hover:text-error"
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete budget item?"
        description={`"${item.name}" will be permanently deleted.`}
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        loading={deleting}
        destructive
        onConfirm={() => void deleteLineItem({ variables: { id: item.id } })}
      />
    </>
  );
}
