"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { formatShortDate, budgetPurchaseDragId } from "@life/shared";
import type { BudgetPurchase } from "@/components/finance/budget/types";
import { formatCadCents } from "@/lib/budget-money";
import { cn } from "@/lib/cn";

type BudgetPurchaseChipProps = {
  purchase: BudgetPurchase;
  onDelete?: () => void;
  overlay?: boolean;
  deleting?: boolean;
};

export function BudgetPurchaseChip({
  purchase,
  onDelete,
  overlay = false,
  deleting = false,
}: BudgetPurchaseChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: budgetPurchaseDragId(purchase.id),
    data: { purchaseId: purchase.id },
    disabled: overlay,
  });

  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 shadow-sm",
        isDragging && "opacity-0",
        overlay && "cursor-grabbing shadow-lg",
      )}
    >
      {!overlay ? (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="shrink-0 cursor-grab rounded p-0.5 text-text-muted hover:text-text-main active:cursor-grabbing"
          aria-label={`Drag ${purchase.name}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-main">{purchase.name}</p>
        <p className="text-xs text-text-muted">
          {formatCadCents(purchase.amountCents)} · {formatShortDate(purchase.purchaseDate)}
          {purchase.source === "VISA" ? " · Card" : ""}
        </p>
      </div>

      {!overlay && onDelete ? (
        <button
          type="button"
          disabled={deleting}
          onClick={onDelete}
          className="shrink-0 rounded p-1 text-text-muted hover:bg-background hover:text-error"
          aria-label={`Delete ${purchase.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
