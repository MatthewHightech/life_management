"use client";

import type { GearItem, GearItemClass } from "@/components/gear/types";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type GearDeleteModalsProps = {
  deleteItem: GearItem | null;
  deleteClass: GearItemClass | null;
  deleteVariant: { itemClass: GearItemClass; variant: GearItemClass["variants"][number] } | null;
  deletingItem: boolean;
  deletingClass: boolean;
  deletingVariant: boolean;
  onCloseItem: () => void;
  onCloseClass: () => void;
  onCloseVariant: () => void;
  onConfirmDeleteItem: (id: string) => void;
  onConfirmDeleteClass: (id: string) => void;
  onConfirmDeleteVariant: (id: string) => void;
};

export function GearDeleteModals({
  deleteItem,
  deleteClass,
  deleteVariant,
  deletingItem,
  deletingClass,
  deletingVariant,
  onCloseItem,
  onCloseClass,
  onCloseVariant,
  onConfirmDeleteItem,
  onConfirmDeleteClass,
  onConfirmDeleteVariant,
}: GearDeleteModalsProps) {
  return (
    <>
      <ConfirmModal
        open={Boolean(deleteItem)}
        onOpenChange={(open) => !open && onCloseItem()}
        title="Delete gear item?"
        description={deleteItem ? `"${deleteItem.name}" will be permanently deleted.` : undefined}
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        loading={deletingItem}
        destructive
        onConfirm={() => {
          if (deleteItem) {
            onConfirmDeleteItem(deleteItem.id);
          }
        }}
      />
      <ConfirmModal
        open={Boolean(deleteClass)}
        onOpenChange={(open) => !open && onCloseClass()}
        title="Delete item class?"
        description={
          deleteClass
            ? `"${deleteClass.name}" and all ${deleteClass.variants.length} variant(s) will be permanently deleted.`
            : undefined
        }
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        loading={deletingClass}
        destructive
        onConfirm={() => {
          if (deleteClass) {
            onConfirmDeleteClass(deleteClass.id);
          }
        }}
      />
      <ConfirmModal
        open={Boolean(deleteVariant)}
        onOpenChange={(open) => !open && onCloseVariant()}
        title="Delete variant?"
        description={
          deleteVariant ? `"${deleteVariant.variant.name}" will be permanently deleted.` : undefined
        }
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        loading={deletingVariant}
        destructive
        onConfirm={() => {
          if (deleteVariant) {
            onConfirmDeleteVariant(deleteVariant.variant.id);
          }
        }}
      />
    </>
  );
}
