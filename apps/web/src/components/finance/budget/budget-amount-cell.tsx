"use client";

import { useEffect, useRef } from "react";
import { InlineEditInput } from "@/components/ui/inline-edit-input";
import { useTextInlineEdit } from "@/hooks/use-text-inline-edit";
import { formatCadCents, parseCadInputToCents } from "@life/shared";
import { inlineFieldTriggerClass } from "@/lib/inline-edit-styles";
import { cn } from "@/lib/cn";

type BudgetAmountCellProps = {
  valueCents: number;
  onSave: (valueCents: number) => Promise<void>;
  className?: string;
};

export function BudgetAmountCell({ valueCents, onSave, className }: BudgetAmountCellProps) {
  const displayValue = formatCadCents(valueCents);
  const edit = useTextInlineEdit<number>({
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
    if (!edit.editing) {
      return;
    }
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }, [edit.editing]);

  if (edit.editing) {
    return (
      <InlineEditInput
        ref={inputRef}
        edit={edit}
        className={cn("w-full min-w-0 text-right tabular-nums", className)}
      />
    );
  }

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => edit.setEditing(true)}
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
