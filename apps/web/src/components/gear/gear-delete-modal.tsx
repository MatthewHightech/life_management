"use client";

import { useMutation } from "@apollo/client";
import {
  DeleteGearItemClassDocument,
  DeleteGearItemDocument,
  DeleteGearVariantDocument,
} from "@/graphql";
import type { GearItem, GearItemClass, GearVariant } from "@/components/gear/types";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { GEAR_PAGE_REFETCH } from "@/lib/refetch-queries";

export type GearDeleteTarget =
  | { kind: "item"; item: GearItem }
  | { kind: "class"; itemClass: GearItemClass }
  | { kind: "variant"; variant: GearVariant };

function describeTarget(target: GearDeleteTarget) {
  switch (target.kind) {
    case "item":
      return { title: "Delete gear item?", description: `"${target.item.name}" will be permanently deleted.` };
    case "class":
      return {
        title: "Delete item class?",
        description: `"${target.itemClass.name}" and all ${target.itemClass.variants.length} variant(s) will be permanently deleted.`,
      };
    case "variant":
      return { title: "Delete variant?", description: `"${target.variant.name}" will be permanently deleted.` };
  }
}

type GearDeleteModalProps = {
  target: GearDeleteTarget | null;
  onClose: () => void;
};

export function GearDeleteModal({ target, onClose }: GearDeleteModalProps) {
  const mutationOptions = {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
    onCompleted: onClose,
  };
  const [deleteItem, itemState] = useMutation(DeleteGearItemDocument, mutationOptions);
  const [deleteClass, classState] = useMutation(DeleteGearItemClassDocument, mutationOptions);
  const [deleteVariant, variantState] = useMutation(DeleteGearVariantDocument, mutationOptions);

  function handleConfirm() {
    if (target?.kind === "item") {
      void deleteItem({ variables: { id: target.item.id } });
    } else if (target?.kind === "class") {
      void deleteClass({ variables: { id: target.itemClass.id } });
    } else if (target?.kind === "variant") {
      void deleteVariant({ variables: { id: target.variant.id } });
    }
  }

  const copy = target ? describeTarget(target) : null;

  return (
    <ConfirmModal
      open={Boolean(target)}
      onOpenChange={(open) => !open && onClose()}
      title={copy?.title ?? ""}
      description={copy?.description}
      confirmLabel="Delete"
      loadingLabel="Deleting…"
      loading={itemState.loading || classState.loading || variantState.loading}
      destructive
      onConfirm={handleConfirm}
    />
  );
}
