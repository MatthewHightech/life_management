"use client";

import { useMutation } from "@apollo/client";
import { Trash2 } from "lucide-react";
import type { BudgetLineItem } from "@/components/finance/types";
import { BudgetAmountCell } from "@/components/finance/budget-amount-cell";
import { BudgetProgressBar } from "@/components/finance/budget-progress-bar";
import { EditableTextCell } from "@/components/editable-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { formatCadCents } from "@/lib/budget-money";
import { BUDGET_PAGE_REFETCH } from "@/lib/budget-queries";
import {
  DELETE_BUDGET_LINE_ITEM_MUTATION,
  UPDATE_BUDGET_LINE_ITEM_MUTATION,
} from "@/graphql";
import { useState } from "react";

type BudgetLineItemRowProps = {
  item: BudgetLineItem;
};

export function BudgetLineItemRow({ item }: BudgetLineItemRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutationOptions = { refetchQueries: [...BUDGET_PAGE_REFETCH], awaitRefetchQueries: true };

  const [updateLineItem] = useMutation(UPDATE_BUDGET_LINE_ITEM_MUTATION, mutationOptions);
  const [deleteLineItem, { loading: deleting }] = useMutation(DELETE_BUDGET_LINE_ITEM_MUTATION, {
    ...mutationOptions,
    onCompleted: () => setConfirmOpen(false),
  });

  return (
    <>
      <tr className="border-b border-border-subtle bg-surface/60">
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
        <td className="px-3 py-1.5 text-right tabular-nums text-text-main">
          {formatCadCents(item.remainingCents)}
        </td>
        <td className="px-3 py-1.5">
          <BudgetProgressBar percent={item.progressPercent} />
        </td>
        <td className="px-3 py-1.5 text-right">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded p-1 text-text-muted hover:bg-background hover:text-error"
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
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
