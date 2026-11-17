"use client";

import { InlineEditInput } from "@/components/ui/inline-edit-input";
import { useTextInlineEdit } from "@/hooks/use-text-inline-edit";
import { formatCadCents, parseCadInputToCents } from "@life/shared";
import { inlineFieldTriggerClass } from "@/lib/inline-edit-styles";
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
      <InlineEditInput
        autoFocus
        inputMode="decimal"
        placeholder="—"
        edit={edit}
        className="text-right tabular-nums"
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
