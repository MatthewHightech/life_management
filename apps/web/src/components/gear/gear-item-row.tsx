"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { GearItem } from "@/components/gear/types";
import { GearConditionChip } from "@/components/gear/gear-condition-chip";
import { GearPhotoThumb } from "@/components/gear/gear-photo-thumb";
import { Chip } from "@/components/ui/chip";
import { canLendGearCondition, gearItemDragId } from "@life/shared";
import { cn } from "@/lib/cn";

type GearItemRowProps = {
  item: GearItem;
  onEdit: (item: GearItem) => void;
  onDelete: (item: GearItem) => void;
  overlay?: boolean;
};

export function GearItemRow({ item, onEdit, onDelete, overlay = false }: GearItemRowProps) {
  const lendable = canLendGearCondition(item.condition) && !item.isOnLoan;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: gearItemDragId(item.id),
    data: { kind: "item", id: item.id },
    disabled: overlay || !lendable,
  });

  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 shadow-sm",
        isDragging && "opacity-0",
        overlay && "cursor-grabbing shadow-lg",
        item.condition === "RETIRED" && "opacity-70",
      )}
    >
      {!overlay && lendable ? (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="shrink-0 cursor-grab rounded p-0.5 text-text-muted hover:text-text-main active:cursor-grabbing"
          aria-label={`Drag ${item.name}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      ) : (
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-border-subtle" />
      )}

      <GearPhotoThumb kind="item" id={item.id} hasPhoto={item.hasPhoto} alt={item.name} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-text-main">{item.name}</span>
          <GearConditionChip condition={item.condition} />
          {item.isOnLoan ? (
            <Chip className="bg-muted-blue/40 text-text-main">Out on loan</Chip>
          ) : null}
        </div>
        <p className="truncate text-xs text-text-muted">
          {[item.size, item.description].filter(Boolean).join(" · ") || "No details"}
        </p>
      </div>

      {!overlay ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded p-1 text-text-muted hover:bg-background hover:text-text-main"
            aria-label={`Edit ${item.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            disabled={item.isOnLoan}
            className="rounded p-1 text-text-muted hover:bg-background hover:text-error disabled:opacity-40"
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </article>
  );
}
