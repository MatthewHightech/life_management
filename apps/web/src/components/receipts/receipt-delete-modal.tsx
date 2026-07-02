"use client";

import { useMutation } from "@apollo/client";
import { DELETE_RECEIPT_MUTATION } from "@/graphql";
import { RECEIPT_LIBRARY_REFETCH } from "@/lib/receipt-queries";
import type { ReceiptItem } from "@/components/receipts/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type ReceiptDeleteModalProps = {
  receipt: ReceiptItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReceiptDeleteModal({ receipt, open, onOpenChange }: ReceiptDeleteModalProps) {
  const [deleteReceipt, { loading }] = useMutation(DELETE_RECEIPT_MUTATION, {
    refetchQueries: [...RECEIPT_LIBRARY_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete receipt?"
      description={receipt ? `"${receipt.fileName}" will be permanently removed.` : undefined}
    >
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={loading || !receipt}
          onClick={() => receipt && void deleteReceipt({ variables: { id: receipt.id } })}
        >
          {loading ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
