"use client";

import { useMutation } from "@apollo/client";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import {
  purchaseDateOutsideBudgetMonthNotice,
  startOfDay,
} from "@life/shared";
import { BudgetPurchaseDatePicker } from "@/components/finance/budget-purchase-date-picker";
import { CREATE_BUDGET_PURCHASE_MUTATION } from "@/graphql";
import { focusLeavesRow } from "@/lib/focus-utils";
import { parseCadInputToCents } from "@/lib/budget-money";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { BUDGET_PAGE_REFETCH } from "@/lib/budget-queries";
import { cn } from "@/lib/cn";

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
  const rowRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => startOfDay(new Date()));

  const [createPurchase, { loading }] = useMutation(CREATE_BUDGET_PURCHASE_MUTATION, {
    refetchQueries: [...BUDGET_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function commitCreate() {
    const trimmedName = name.trim();
    const amountCents = parseCadInputToCents(amount);
    if (!trimmedName || amountCents === null) {
      onCancel();
      return;
    }

    await createPurchase({
      variables: {
        input: {
          name: trimmedName,
          amountCents,
          purchaseDate: format(purchaseDate, "yyyy-MM-dd"),
        },
      },
    });

    onCreated(purchaseDateOutsideBudgetMonthNotice(purchaseDate, budgetYear, budgetMonth));
  }

  const draftInputClass = cn(inlineFieldInputClass, "max-w-full min-w-0");

  return (
    <div
      ref={rowRef}
      className="grid gap-2 rounded-lg border border-border-subtle bg-background/80 p-2 sm:grid-cols-[minmax(0,1fr)_7rem_6.5rem]"
    >
      <input
        ref={nameRef}
        value={name}
        disabled={loading}
        placeholder="Purchase name"
        onChange={(event) => setName(event.target.value)}
        onBlur={(event) => {
          if (focusLeavesRow(event, rowRef.current)) {
            void commitCreate();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commitCreate();
          }
          if (event.key === "Escape") {
            onCancel();
          }
        }}
        className={draftInputClass}
      />
      <input
        value={amount}
        disabled={loading}
        placeholder="$0.00"
        onChange={(event) => setAmount(event.target.value)}
        onBlur={(event) => {
          if (focusLeavesRow(event, rowRef.current)) {
            void commitCreate();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commitCreate();
          }
          if (event.key === "Escape") {
            onCancel();
          }
        }}
        className={cn(draftInputClass, "text-right tabular-nums")}
      />
      <BudgetPurchaseDatePicker
        value={purchaseDate}
        disabled={loading}
        onChange={setPurchaseDate}
      />
    </div>
  );
}
