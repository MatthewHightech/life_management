"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@apollo/client";
import { GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CREATE_GEAR_VARIANT_MUTATION,
  UPDATE_GEAR_VARIANT_MUTATION,
} from "@/graphql";
import type { GearCondition, GearItemClass, GearVariant } from "@/components/gear/types";
import { gearConditionSelectOptions } from "@/components/gear/gear-condition-select";
import { GearPhotoThumb } from "@/components/gear/gear-photo-thumb";
import {
  EditableSelectCell,
  EditableTable,
  EditableTableBody,
  EditableTableCell,
  EditableTableHead,
  EditableTableHeaderCell,
  EditableTableRow,
  EditableTextCell,
} from "@/components/editable-table";
import { GEAR_PAGE_REFETCH } from "@/lib/gear-queries";
import { uploadGearVariantPhoto } from "@/lib/gear-photo";
import { focusLeavesRow } from "@/lib/focus-utils";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { canLendGearCondition, gearVariantDragId } from "@life/shared";
import { cn } from "@/lib/cn";

export function GearVariantDragPreview({ variant }: { variant: GearVariant }) {
  return (
    <div className="flex cursor-grabbing items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 shadow-lg">
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      <GearPhotoThumb
        kind="variant"
        id={variant.id}
        hasPhoto={variant.hasPhoto}
        alt={variant.name}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-main">{variant.name}</p>
        {variant.size ? <p className="truncate text-xs text-text-muted">{variant.size}</p> : null}
      </div>
    </div>
  );
}

const PHOTO_COL_CLASS = "w-[4.75rem] max-w-none";

const VARIANT_TABLE_COLS = (
  <colgroup>
    <col className="w-8" />
    <col className={PHOTO_COL_CLASS} />
    <col />
    <col className="w-[22%]" />
    <col className="w-[24%]" />
    <col className="w-10" />
  </colgroup>
);

type GearVariantTableProps = {
  itemClass: GearItemClass;
  isAddingNew: boolean;
  onCancelAddNew: () => void;
  onDeleteVariant: (variant: GearVariant) => void;
};

type GearVariantRowProps = {
  variant: GearVariant;
  onUpdate: (input: { name?: string; size?: string | null; condition?: GearCondition }) => Promise<void>;
  onDelete: () => void;
  overlay?: boolean;
};

function GearVariantRow({ variant, onUpdate, onDelete, overlay = false }: GearVariantRowProps) {
  const onLoan = variant.isOnLoan;
  const lendable = canLendGearCondition(variant.condition) && !onLoan;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: gearVariantDragId(variant.id),
    data: { kind: "variant", id: variant.id },
    disabled: overlay || !lendable,
  });

  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };

  return (
    <EditableTableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "opacity-0",
        variant.condition === "RETIRED" && !onLoan && "opacity-70",
        onLoan && "bg-background/80 text-text-muted",
      )}
    >
      <EditableTableCell className="w-8 max-w-8 px-1">
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
      </EditableTableCell>
      <EditableTableCell className={PHOTO_COL_CLASS}>
        <GearPhotoThumb
          kind="variant"
          id={variant.id}
          hasPhoto={variant.hasPhoto}
          alt={variant.name}
          interactive={!overlay}
          disabled={onLoan}
          onPhotoSelect={(file) => void uploadGearVariantPhoto(variant.id, file)}
        />
      </EditableTableCell>
      <EditableTableCell>
        <EditableTextCell
          value={variant.name}
          disabled={onLoan}
          onSave={async (name) => onUpdate({ name })}
          className="font-medium text-text-main"
          inputClassName="font-medium"
        />
      </EditableTableCell>
      <EditableTableCell>
        <EditableTextCell
          value={variant.size ?? ""}
          allowClear
          disabled={onLoan}
          onSave={async (size) => onUpdate({ size: size || null })}
          displayPlaceholder="Add size"
        />
      </EditableTableCell>
      <EditableTableCell>
        <EditableSelectCell
          value={variant.condition}
          options={gearConditionSelectOptions}
          onSave={async (condition) => onUpdate({ condition })}
          disabled={onLoan}
        />
      </EditableTableCell>
      {!overlay ? (
        <EditableTableCell className="w-10 max-w-10">
          <button
            type="button"
            onClick={onDelete}
            disabled={onLoan}
            className="rounded p-1 text-text-muted hover:bg-background hover:text-error disabled:opacity-40"
            aria-label={`Delete ${variant.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </EditableTableCell>
      ) : null}
    </EditableTableRow>
  );
}

type NewVariantRowProps = {
  classId: string;
  onCreated: () => void;
  onCancel: () => void;
};

function NewVariantRow({ classId, onCreated, onCancel }: NewVariantRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState<GearCondition>("GOOD");

  const [createVariant, { loading }] = useMutation(CREATE_GEAR_VARIANT_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function commitCreate() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      onCancel();
      return;
    }

    await createVariant({
      variables: {
        input: {
          classId,
          name: trimmedName,
          size: size.trim() || null,
          condition,
        },
      },
    });
    onCreated();
  }

  const draftInputClass = cn(inlineFieldInputClass, "max-w-full min-w-0");

  return (
    <EditableTableRow ref={rowRef} className="bg-background/80">
      <EditableTableCell className="w-8 max-w-8 px-1">
        <GripVertical className="h-3.5 w-3.5 text-border-subtle" />
      </EditableTableCell>
      <EditableTableCell className={PHOTO_COL_CLASS}>
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-border-subtle bg-background text-xs text-text-muted">
          —
        </span>
      </EditableTableCell>
      <EditableTableCell>
        <div className="min-w-0 max-w-full overflow-hidden">
          <input
            ref={nameRef}
            value={name}
            disabled={loading}
            placeholder="Variant name"
            onChange={(event) => setName(event.target.value)}
            onBlur={(event) => {
              if (focusLeavesRow(event, rowRef.current)) {
                void commitCreate();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void commitCreate();
              }
              if (event.key === "Escape") {
                onCancel();
              }
            }}
            className={cn(draftInputClass, "font-medium")}
          />
        </div>
      </EditableTableCell>
      <EditableTableCell>
        <div className="min-w-0 max-w-full overflow-hidden">
          <input
            value={size}
            disabled={loading}
            placeholder="Size"
            onChange={(event) => setSize(event.target.value)}
            onBlur={(event) => {
              if (focusLeavesRow(event, rowRef.current)) {
                void commitCreate();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void commitCreate();
              }
              if (event.key === "Escape") {
                onCancel();
              }
            }}
            className={draftInputClass}
          />
        </div>
      </EditableTableCell>
      <EditableTableCell>
        <EditableSelectCell
          value={condition}
          options={gearConditionSelectOptions}
          onSave={async (next) => setCondition(next)}
        />
      </EditableTableCell>
      <EditableTableCell className="w-10 max-w-10">
        <button
          type="button"
          onClick={onCancel}
          className="rounded p-1 text-text-muted hover:bg-background hover:text-text-main"
          aria-label="Cancel new variant"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </EditableTableCell>
    </EditableTableRow>
  );
}

export function GearVariantTable({
  itemClass,
  isAddingNew,
  onCancelAddNew,
  onDeleteVariant,
}: GearVariantTableProps) {
  const [updateVariant] = useMutation(UPDATE_GEAR_VARIANT_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });

  async function handleUpdate(
    variantId: string,
    input: { name?: string; size?: string | null; condition?: GearCondition },
  ) {
    await updateVariant({ variables: { id: variantId, input } });
  }

  const isEmpty = itemClass.variants.length === 0 && !isAddingNew;

  return (
    <EditableTable>
      {VARIANT_TABLE_COLS}
      <EditableTableHead>
        <EditableTableRow>
          <EditableTableHeaderCell className="w-8 max-w-8 px-1" />
          <EditableTableHeaderCell className={PHOTO_COL_CLASS}>Photo</EditableTableHeaderCell>
          <EditableTableHeaderCell>Name</EditableTableHeaderCell>
          <EditableTableHeaderCell>Size</EditableTableHeaderCell>
          <EditableTableHeaderCell>Condition</EditableTableHeaderCell>
          <EditableTableHeaderCell className="w-10 max-w-10" />
        </EditableTableRow>
      </EditableTableHead>
      <EditableTableBody>
        {isEmpty ? (
          <EditableTableRow>
            <EditableTableCell colSpan={6} className="max-w-none py-4 text-center text-sm text-text-muted">
              No variants yet. Use + to add a row.
            </EditableTableCell>
          </EditableTableRow>
        ) : null}
        {itemClass.variants.map((variant) => (
          <GearVariantRow
            key={variant.id}
            variant={variant}
            onUpdate={(input) => handleUpdate(variant.id, input)}
            onDelete={() => onDeleteVariant(variant)}
          />
        ))}
        {isAddingNew ? (
          <NewVariantRow
            classId={itemClass.id}
            onCreated={onCancelAddNew}
            onCancel={onCancelAddNew}
          />
        ) : null}
      </EditableTableBody>
    </EditableTable>
  );
}
