"use client";

import { useEffect, useRef } from "react";
import { useTextInlineEdit } from "@/hooks/use-text-inline-edit";
import { formatCadCents, parseCadInputToCents } from "@/lib/budget-money";
import { inlineFieldInputClass, inlineFieldTriggerClass } from "@/lib/inline-edit-styles";
import { cn } from "@/lib/cn";

type BudgetAmountCellProps = {
  valueCents: number;
  onSave: (valueCents: number) => Promise<void>;
  className?: string;
};

export function BudgetAmountCell({ valueCents, onSave, className }: BudgetAmountCellProps) {
  const displayValue = formatCadCents(valueCents);
  const { editing, setEditing, draft, setDraft, pending, commit, cancel } = useTextInlineEdit<number>({
    value: displayValue,
    onSave,
    resolveCommit: (draftValue) => {
      const cents = parseCadInputToCents(draftValue);
      if (cents === null || cents === valueCents) {
        return null;
      }
      return cents;
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      return;
    }
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        disabled={pending}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commit();
          }
          if (event.key === "Escape") {
            cancel();
          }
        }}
        className={cn(inlineFieldInputClass, "w-full min-w-0 text-right tabular-nums", className)}
      />
    );
  }

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => setEditing(true)}
      className={cn(
        inlineFieldTriggerClass,
        "justify-end text-right tabular-nums",
        className,
      )}
    >
      {displayValue}
    </button>
  );
}
