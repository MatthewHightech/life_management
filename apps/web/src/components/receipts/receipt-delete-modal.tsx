"use client";

import { useMutation } from "@apollo/client";
import { DeleteReceiptDocument } from "@/graphql";
import { RECEIPT_LIBRARY_REFETCH } from "@/lib/refetch-queries";
import type { ReceiptItem } from "@/components/receipts/types";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type ReceiptDeleteModalProps = {
  receipt: ReceiptItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReceiptDeleteModal({ receipt, open, onOpenChange }: ReceiptDeleteModalProps) {
  const [deleteReceipt, { loading }] = useMutation(DeleteReceiptDocument, {
    refetchQueries: [...RECEIPT_LIBRARY_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete receipt?"
      description={receipt ? `"${receipt.fileName}" will be permanently removed.` : undefined}
      confirmLabel="Delete"
      loadingLabel="Deleting…"
      loading={loading}
      onConfirm={() => {
        if (receipt) {
          void deleteReceipt({ variables: { id: receipt.id } });
        }
      }}
    />
  );
}
