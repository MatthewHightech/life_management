"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { RENAME_RECEIPT_MUTATION } from "@/graphql";
import { RECEIPT_LIBRARY_REFETCH } from "@/lib/receipt-queries";
import type { ReceiptItem } from "@/components/receipts/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type ReceiptRenameModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: ReceiptItem | null;
};

export function ReceiptRenameModal({ open, onOpenChange, receipt }: ReceiptRenameModalProps) {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (open && receipt) {
      setFileName(receipt.fileName);
    }
  }, [open, receipt]);

  const [renameReceipt, { loading }] = useMutation(RENAME_RECEIPT_MUTATION, {
    refetchQueries: [...RECEIPT_LIBRARY_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!receipt) {
      return;
    }

    const trimmed = fileName.trim();
    if (!trimmed) {
      return;
    }

    await renameReceipt({ variables: { id: receipt.id, fileName: trimmed } });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Rename receipt" className="w-[min(100%-2rem,28rem)]">
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">File name</span>
          <input
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            required
            autoFocus
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !fileName.trim()}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
