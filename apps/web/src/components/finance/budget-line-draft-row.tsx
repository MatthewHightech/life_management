"use client";

import { useMutation } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { CREATE_BUDGET_LINE_ITEM_MUTATION } from "@/graphql";
import { focusLeavesRow } from "@/lib/focus-utils";
import { parseCadInputToCents } from "@/lib/budget-money";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { BUDGET_PAGE_REFETCH } from "@/lib/budget-queries";
import { cn } from "@/lib/cn";

type BudgetLineDraftRowProps = {
  sectionId: string;
  onCreated: () => void;
  onCancel: () => void;
};

export function BudgetLineDraftRow({ sectionId, onCreated, onCancel }: BudgetLineDraftRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const [createLineItem, { loading }] = useMutation(CREATE_BUDGET_LINE_ITEM_MUTATION, {
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

    await createLineItem({
      variables: {
        input: {
          sectionId,
          name: trimmedName,
          amountCents,
        },
      },
    });
    onCreated();
  }

  const draftInputClass = cn(inlineFieldInputClass, "max-w-full min-w-0");

  return (
    <tr ref={rowRef} className="border-b border-border-subtle bg-background/80">
      <td className="max-w-0 overflow-hidden px-3 py-1.5 pl-10">
        <input
          ref={nameRef}
          value={name}
          disabled={loading}
          placeholder="Item name"
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
      </td>
      <td className="px-3 py-1.5">
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
      </td>
      <td className="px-3 py-1.5" />
      <td className="px-3 py-1.5" />
      <td className="px-3 py-1.5" />
      <td className="px-3 py-1.5" />
    </tr>
  );
}
