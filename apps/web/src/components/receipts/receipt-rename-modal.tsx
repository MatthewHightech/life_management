"use client";

import { useMutation } from "@apollo/client";
import { RenameReceiptDocument } from "@/graphql";
import { RECEIPT_LIBRARY_REFETCH } from "@/lib/refetch-queries";
import type { ReceiptItem } from "@/components/receipts/types";
import { RenameModal } from "@/components/ui/rename-modal";

type ReceiptRenameModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: ReceiptItem | null;
};

export function ReceiptRenameModal({ open, onOpenChange, receipt }: ReceiptRenameModalProps) {
  const [renameReceipt, { loading }] = useMutation(RenameReceiptDocument, {
    refetchQueries: [...RECEIPT_LIBRARY_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  return (
    <RenameModal
      open={open}
      onOpenChange={onOpenChange}
      title="Rename receipt"
      label="File name"
      initialName={receipt?.fileName ?? ""}
      loading={loading}
      onSubmit={async (fileName) => {
        if (receipt) {
          await renameReceipt({ variables: { id: receipt.id, fileName } });
        }
      }}
    />
  );
}
