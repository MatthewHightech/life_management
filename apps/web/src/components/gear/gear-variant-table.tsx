"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { GearItemClass, GearVariant } from "@/components/gear/types";
import { GearConditionChip } from "@/components/gear/gear-condition-chip";
import { GearPhotoThumb } from "@/components/gear/gear-photo-thumb";
import { Chip } from "@/components/ui/chip";
import { canLendGearCondition, gearVariantDragId } from "@life/shared";
import { cn } from "@/lib/cn";

type GearVariantRowProps = {
  variant: GearVariant;
  onEdit: () => void;
  onDelete: () => void;
  overlay?: boolean;
};

export function GearVariantRow({ variant, onEdit, onDelete, overlay = false }: GearVariantRowProps) {
  const lendable = canLendGearCondition(variant.condition) && !variant.isOnLoan;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: gearVariantDragId(variant.id),
    data: { kind: "variant", id: variant.id },
    disabled: overlay || !lendable,
  });

  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-border-subtle last:border-b-0",
        isDragging && "opacity-0",
        variant.condition === "RETIRED" && "opacity-70",
      )}
    >
      <td className="w-8 px-1 py-1.5">
        {!overlay && lendable ? (
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="cursor-grab rounded p-0.5 text-text-muted hover:text-text-main active:cursor-grabbing"
            aria-label={`Drag ${variant.name}`}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : (
          <GripVertical className="h-3.5 w-3.5 text-border-subtle" />
        )}
      </td>
      <td className="px-2 py-1.5">
        <GearPhotoThumb kind="variant" id={variant.id} hasPhoto={variant.hasPhoto} alt={variant.name} />
      </td>
      <td className="px-2 py-1.5 text-sm text-text-main">{variant.name}</td>
      <td className="px-2 py-1.5 text-sm text-text-muted">{variant.size || "—"}</td>
      <td className="px-2 py-1.5">
        <GearConditionChip condition={variant.condition} />
      </td>
      <td className="px-2 py-1.5">
        {variant.isOnLoan ? (
          <Chip className="bg-muted-blue/40 text-text-main">Out on loan</Chip>
        ) : null}
      </td>
      {!overlay ? (
        <td className="px-2 py-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="rounded p-1 text-text-muted hover:bg-background hover:text-text-main"
              aria-label={`Edit ${variant.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={variant.isOnLoan}
              className="rounded p-1 text-text-muted hover:bg-background hover:text-error disabled:opacity-40"
              aria-label={`Delete ${variant.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      ) : null}
    </tr>
  );
}

type GearVariantTableProps = {
  itemClass: GearItemClass;
  onEditVariant: (variant: GearVariant) => void;
  onDeleteVariant: (variant: GearVariant) => void;
};

export function GearVariantTable({ itemClass, onEditVariant, onDeleteVariant }: GearVariantTableProps) {
  if (itemClass.variants.length === 0) {
    return <p className="text-sm text-text-muted">No variants yet. Add one to track individual units.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border-subtle">
      <table className="min-w-full text-left">
        <thead className="bg-background text-xs uppercase tracking-wide text-text-muted">
          <tr>
            <th className="px-1 py-2" />
            <th className="px-2 py-2">Photo</th>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Size</th>
            <th className="px-2 py-2">Condition</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {itemClass.variants.map((variant) => (
            <GearVariantRow
              key={variant.id}
              variant={variant}
              onEdit={() => onEditVariant(variant)}
              onDelete={() => onDeleteVariant(variant)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
