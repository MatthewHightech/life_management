"use client";

import { useMutation } from "@apollo/client";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BudgetScope } from "@/components/finance/budget/budget-scope";
import type { BudgetSection } from "@/components/finance/budget/types";
import { BudgetLineDraftRow } from "@/components/finance/budget/budget-line-draft-row";
import { BudgetLineItemRow } from "@/components/finance/budget/budget-line-item-row";
import { BudgetProgressBar } from "@/components/finance/budget/budget-progress-bar";
import { EditableTextCell } from "@/components/editable-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { formatBudgetRemainingLabel, formatCadCents } from "@/lib/budget-money";
import { BUDGET_PAGE_REFETCH } from "@/lib/budget-queries";
import { DELETE_BUDGET_SECTION_MUTATION, UPDATE_BUDGET_SECTION_MUTATION } from "@/graphql";
import { cn } from "@/lib/cn";

type BudgetSectionRowProps = {
  section: BudgetSection;
  scope: BudgetScope;
  expanded: boolean;
  isAddingItem: boolean;
  onToggleExpanded: () => void;
  onAddItem: () => void;
  onCancelAddItem: () => void;
};

export function BudgetSectionRow({
  section,
  scope,
  expanded,
  isAddingItem,
  onToggleExpanded,
  onAddItem,
  onCancelAddItem,
}: BudgetSectionRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutationOptions = { refetchQueries: [...BUDGET_PAGE_REFETCH], awaitRefetchQueries: true };

  const [updateSection] = useMutation(UPDATE_BUDGET_SECTION_MUTATION, mutationOptions);
  const [deleteSection, { loading: deleting }] = useMutation(DELETE_BUDGET_SECTION_MUTATION, {
    ...mutationOptions,
    onCompleted: () => setConfirmOpen(false),
  });

  return (
    <>
      <tr className="border-b border-border-subtle bg-sage/30">
        <td className="max-w-0 overflow-hidden px-3 py-2">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={onToggleExpanded}
              className="shrink-0 rounded p-0.5 text-text-muted hover:bg-surface"
              aria-expanded={expanded}
              aria-label={expanded ? `Collapse ${section.name}` : `Expand ${section.name}`}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <div className="min-w-0 flex-1">
              <EditableTextCell
                value={section.name}
                wrap
                onSave={async (name) => {
                  await updateSection({ variables: { id: section.id, name } });
                }}
                className="text-sm font-semibold text-text-main"
              />
            </div>
          </div>
        </td>
        <td className="px-3 py-2 text-right tabular-nums font-medium text-text-main">
          {formatCadCents(section.budgetCents)}
        </td>
        <td className="px-3 py-2 text-right tabular-nums text-text-muted">
          {formatCadCents(section.spentCents)}
        </td>
        <td
          className={cn(
            "px-3 py-2 text-right tabular-nums font-medium",
            section.remainingCents < 0 ? "text-error" : "text-text-main",
          )}
        >
          {formatBudgetRemainingLabel(section.budgetCents, section.spentCents)}
        </td>
        <td className="px-3 py-2">
          <BudgetProgressBar percent={section.progressPercent} />
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onAddItem}
              className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-main"
              aria-label={`Add item to ${section.name}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded p-1 text-text-muted hover:bg-surface hover:text-error"
              aria-label={`Delete ${section.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {expanded
        ? section.lineItems.map((item) => (
            <BudgetLineItemRow key={item.id} item={item} scope={scope} />
          ))
        : null}
      {expanded && isAddingItem ? (
        <BudgetLineDraftRow
          sectionId={section.id}
          onCreated={onCancelAddItem}
          onCancel={onCancelAddItem}
        />
      ) : null}

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete section?"
        description={
          section.lineItems.length === 0
            ? `"${section.name}" will be permanently deleted.`
            : `"${section.name}" and all ${section.lineItems.length} budget item(s) will be permanently deleted.`
        }
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        loading={deleting}
        destructive
        onConfirm={() => void deleteSection({ variables: { id: section.id } })}
      />
    </>
  );
}
