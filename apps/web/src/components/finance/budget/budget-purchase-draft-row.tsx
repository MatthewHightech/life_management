"use client";

import { useMutation } from "@apollo/client";
import { format } from "date-fns";
import { useState } from "react";
import { purchaseDateOutsideBudgetMonthNotice, startOfDay } from "@life/shared";
import { BudgetPurchaseDatePicker } from "@/components/finance/budget/budget-purchase-date-picker";
import { useBudgetDraftFields } from "@/components/finance/budget/use-budget-draft-fields";
import { CreateBudgetPurchaseDocument } from "@/graphql";
import { BUDGET_PAGE_REFETCH } from "@/lib/refetch-queries";

type BudgetPurchaseDraftRowProps = {
  budgetYear: number;
  budgetMonth: number;
  onCreated: (notice: string | null) => void;
  onCancel: () => void;
};

export function BudgetPurchaseDraftRow({
  budgetYear,
  budgetMonth,
  onCreated,
  onCancel,
}: BudgetPurchaseDraftRowProps) {
  const [purchaseDate, setPurchaseDate] = useState(() => startOfDay(new Date()));

  const [createPurchase, { loading }] = useMutation(CreateBudgetPurchaseDocument, {
    refetchQueries: [...BUDGET_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });

  const { rowRef, nameInputProps, amountInputProps } = useBudgetDraftFields<HTMLDivElement>({
    namePlaceholder: "Purchase name",
    disabled: loading,
    onCancel,
    onSubmit: async ({ name, amountCents }) => {
      await createPurchase({
        variables: {
          input: { name, amountCents, purchaseDate: format(purchaseDate, "yyyy-MM-dd") },
        },
      });
      onCreated(purchaseDateOutsideBudgetMonthNotice(purchaseDate, budgetYear, budgetMonth));
    },
  });

  return (
    <div
      ref={rowRef}
      className="grid gap-2 rounded-lg border border-border-subtle bg-background/80 p-2 sm:grid-cols-[minmax(0,1fr)_7rem_6.5rem]"
    >
      <input {...nameInputProps} />
      <input {...amountInputProps} />
      <BudgetPurchaseDatePicker
        value={purchaseDate}
        disabled={loading}
        onChange={setPurchaseDate}
      />
    </div>
  );
}
