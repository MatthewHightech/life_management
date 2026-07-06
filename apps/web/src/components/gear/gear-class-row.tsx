"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { GearItemClass } from "@/components/gear/types";
import { GearVariantTable } from "@/components/gear/gear-variant-table";
import { gearClassDragId } from "@life/shared";
import { cn } from "@/lib/cn";

type GearClassRowProps = {
  itemClass: GearItemClass;
  expanded: boolean;
  onToggleExpand: (classId: string) => void;
  onEdit: (itemClass: GearItemClass) => void;
  onDelete: (itemClass: GearItemClass) => void;
  onAddVariant: (itemClass: GearItemClass) => void;
  onEditVariant: (itemClass: GearItemClass, variantId: string) => void;
  onDeleteVariant: (itemClass: GearItemClass, variantId: string) => void;
  overlay?: boolean;
};

export function GearClassRow({
  itemClass,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  overlay = false,
}: GearClassRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: gearClassDragId(itemClass.id),
    data: { kind: "class", id: itemClass.id },
    disabled: overlay,
  });

  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };
  const hasOnLoanVariant = itemClass.variants.some((variant) => variant.isOnLoan);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border-subtle bg-surface shadow-sm",
        isDragging && "opacity-0",
        overlay && "cursor-grabbing shadow-lg",
      )}
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        {!overlay ? (
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="shrink-0 cursor-grab rounded p-0.5 text-text-muted hover:text-text-main active:cursor-grabbing"
            aria-label={`Drag ${itemClass.name}`}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : (
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        )}

        <button
          type="button"
          onClick={() => onToggleExpand(itemClass.id)}
          className="shrink-0 rounded p-0.5 text-text-muted hover:text-text-main"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse variants" : "Expand variants"}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-text-main">{itemClass.name}</span>
            <span className="text-xs text-text-muted">
              {itemClass.variants.length} variant{itemClass.variants.length === 1 ? "" : "s"}
            </span>
          </div>
          {itemClass.description ? (
            <p className="truncate text-xs text-text-muted">{itemClass.description}</p>
          ) : null}
        </div>

        {!overlay ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onAddVariant(itemClass)}
              className="rounded p-1 text-text-muted hover:bg-background hover:text-text-main"
              aria-label={`Add variant to ${itemClass.name}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(itemClass)}
              className="rounded p-1 text-text-muted hover:bg-background hover:text-text-main"
              aria-label={`Edit ${itemClass.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(itemClass)}
              disabled={hasOnLoanVariant}
              className="rounded p-1 text-text-muted hover:bg-background hover:text-error disabled:opacity-40"
              aria-label={`Delete ${itemClass.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      {expanded && !overlay ? (
        <div className="border-t border-border-subtle px-2 py-2">
          {itemClass.careInstructions ? (
            <p className="mb-2 text-xs text-text-muted">
              <span className="font-medium text-text-main">Care:</span> {itemClass.careInstructions}
            </p>
          ) : null}
          <GearVariantTable
            itemClass={itemClass}
            onEditVariant={(variant) => onEditVariant(itemClass, variant.id)}
            onDeleteVariant={(variant) => onDeleteVariant(itemClass, variant.id)}
          />
        </div>
      ) : null}
    </div>
  );
}
