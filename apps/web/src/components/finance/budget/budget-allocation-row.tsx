"use client";

import { useMutation } from "@apollo/client";
import { formatShortDate } from "@life/shared";
import { Trash2 } from "lucide-react";
import type { BudgetPurchaseAllocation } from "@/components/finance/budget/types";
import { BudgetAmountCell } from "@/components/finance/budget/budget-amount-cell";
import { EditableTextCell } from "@/components/editable-table";
import {
  DELETE_BUDGET_PURCHASE_ALLOCATION_MUTATION,
  UPDATE_BUDGET_PURCHASE_MUTATION,
} from "@/graphql";
import { formatCadCents } from "@/lib/budget-money";
import { BUDGET_LINE_ALLOCATIONS_REFETCH } from "@/lib/budget-queries";

type BudgetAllocationRowProps = {
  allocation: BudgetPurchaseAllocation;
  onUpdated: () => Promise<void>;
};

export function BudgetAllocationRow({ allocation, onUpdated }: BudgetAllocationRowProps) {
  const mutationOptions = {
    refetchQueries: [...BUDGET_LINE_ALLOCATIONS_REFETCH],
    awaitRefetchQueries: true,
  };

  const [updatePurchase] = useMutation(UPDATE_BUDGET_PURCHASE_MUTATION, mutationOptions);
  const [deleteAllocation, { loading: deleting }] = useMutation(
    DELETE_BUDGET_PURCHASE_ALLOCATION_MUTATION,
    mutationOptions,
  );

  const editable = allocation.source === "MANUAL";

  return (
    <tr className="border-b border-border-subtle">
      <td className="max-w-0 px-3 py-2">
        {editable ? (
          <EditableTextCell
            value={allocation.purchaseName}
            wrap
            onSave={async (name) => {
              await updatePurchase({
                variables: { id: allocation.purchaseId, input: { name } },
              });
              await onUpdated();
            }}
            className="text-sm text-text-main"
          />
        ) : (
          <span className="block px-2 py-0.5 text-sm text-text-main">{allocation.purchaseName}</span>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        {editable ? (
          <BudgetAmountCell
            valueCents={allocation.amountCents}
            onSave={async (amountCents) => {
              await updatePurchase({
                variables: { id: allocation.purchaseId, input: { amountCents } },
              });
              await onUpdated();
            }}
          />
        ) : (
          <span className="block px-2 py-0.5 text-right tabular-nums text-sm text-text-main">
            {formatCadCents(allocation.amountCents)}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-text-muted">
        {formatShortDate(allocation.purchaseDate)}
      </td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          disabled={deleting}
          onClick={() => void deleteAllocation({ variables: { id: allocation.id } }).then(onUpdated)}
          className="rounded p-1 text-text-muted hover:bg-background hover:text-error"
          aria-label={`Remove ${allocation.purchaseName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
