"use client";

import { Check, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { CommentsButton } from "@/components/comments/comments-button";
import {
  EditableTableCell,
  EditableTableRow,
  EditableTextCell,
} from "@/components/editable-table";
import { OptionalBudgetCell } from "@/components/finance/shopping-list/optional-budget-cell";
import { EditablePriority } from "@/components/tasks/task-table/editable-pill-cells";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type {
  ShoppingListQuery,
  TaskPriority,
  UpdateShoppingItemInput,
} from "@/graphql";
import { cn } from "@/lib/cn";

export type ShoppingItem = ShoppingListQuery["shoppingItems"][number];

type ShoppingListRowProps = {
  item: ShoppingItem;
  onUpdate: (id: string, input: UpdateShoppingItemInput) => Promise<void>;
  onSetPurchased: (id: string, purchased: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ShoppingListRow({
  item,
  onUpdate,
  onSetPurchased,
  onDelete,
}: ShoppingListRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const purchased = Boolean(item.purchasedAt);

  return (
    <>
      <EditableTableRow className={cn(purchased && "bg-background/60")}>
        <EditableTableCell className="px-4">
          <div className="flex min-h-7 items-center gap-2">
            <button
              type="button"
              onClick={() => void onSetPurchased(item.id, !purchased)}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
                purchased
                  ? "border-status-done bg-status-done text-on-primary"
                  : "border-border-subtle bg-surface text-transparent hover:border-status-done",
              )}
              aria-label={purchased ? `Restore ${item.name}` : `Mark ${item.name} purchased`}
            >
              {purchased ? <RotateCcw className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            </button>
            <EditableTextCell
              value={item.name}
              onSave={(name) => onUpdate(item.id, { name })}
              className={cn("font-medium", purchased && "text-text-muted line-through")}
            />
          </div>
        </EditableTableCell>

        <EditableTableCell className="px-4">
          <OptionalBudgetCell
            valueCents={item.budgetCents ?? null}
            onSave={(budgetCents) =>
              onUpdate(
                item.id,
                budgetCents == null ? { clearBudget: true } : { budgetCents },
              )
            }
          />
        </EditableTableCell>

        <EditableTableCell className="px-4">
          <EditablePriority
            value={item.urgency}
            onSave={(urgency: TaskPriority) => onUpdate(item.id, { urgency })}
          />
        </EditableTableCell>

        <EditableTableCell className="px-4">
          <Avatar
            name={item.createdBy.name}
            email={item.createdBy.email}
            image={item.createdBy.image}
            className="h-7 w-7"
          />
        </EditableTableCell>

        <EditableTableCell className="px-4">
          <div className="flex min-h-7 items-center justify-end gap-1">
            <CommentsButton
              targetId={item.id}
              targetTitle={item.name}
              commentCount={item.commentCount}
              unreadCommentCount={item.unreadCommentCount}
              placement="row"
            />
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded p-1 text-text-muted hover:bg-background hover:text-error"
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </EditableTableCell>
      </EditableTableRow>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete “${item.name}”?`}
        description="This also deletes its comments."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await onDelete(item.id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
