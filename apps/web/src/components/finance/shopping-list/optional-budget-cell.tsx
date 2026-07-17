"use client";

import { useTextInlineEdit } from "@/hooks/use-text-inline-edit";
import { formatCadCents, parseCadInputToCents } from "@/lib/budget-money";
import { inlineFieldInputClass, inlineFieldTriggerClass } from "@/lib/inline-edit-styles";
import { cn } from "@/lib/cn";

type OptionalBudgetCellProps = {
  valueCents: number | null;
  onSave: (valueCents: number | null) => Promise<void>;
};

export function OptionalBudgetCell({
  valueCents,
  onSave,
}: OptionalBudgetCellProps) {
  const displayValue = valueCents == null ? "" : formatCadCents(valueCents);
  const edit = useTextInlineEdit<{ value: number | null }>({
    value: displayValue,
    onSave: ({ value }) => onSave(value),
    resolveCommit: (draft) => {
      const trimmed = draft.trim();
      const next = trimmed ? parseCadInputToCents(trimmed) : null;
      if (trimmed && next === null) {
        return null;
      }
      if (next === valueCents) {
        return null;
      }
      return { value: next };
    },
  });

  if (edit.editing) {
    return (
      <input
        autoFocus
        inputMode="decimal"
        value={edit.draft}
        disabled={edit.pending}
        placeholder="—"
        onChange={(event) => edit.setDraft(event.target.value)}
        onBlur={() => void edit.commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void edit.commit();
          }
          if (event.key === "Escape") {
            edit.cancel();
          }
        }}
        className={cn(inlineFieldInputClass, "text-right tabular-nums")}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => edit.setEditing(true)}
      className={cn(
        inlineFieldTriggerClass,
        "justify-end text-right tabular-nums",
        valueCents == null && "text-text-muted",
      )}
    >
      {valueCents == null ? "—" : formatCadCents(valueCents)}
    </button>
  );
}
