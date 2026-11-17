"use client";

import { useCallback } from "react";
import type { ReceiptItem } from "@/components/receipts/types";
import { ReceiptEditableNotes } from "@/components/receipts/receipt-editable-notes";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { fetchReceiptBlob } from "@/lib/file-api";
import { formatReceiptAddedDate } from "@/lib/receipt-display";
import { Modal } from "@/components/ui/modal";

type ReceiptPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: ReceiptItem | null;
};

export function ReceiptPreviewModal({ open, onOpenChange, receipt }: ReceiptPreviewModalProps) {
  const receiptId = receipt?.id;
  const loadPreview = useCallback(() => fetchReceiptBlob(receiptId!), [receiptId]);
  const { url: blobUrl, failed } = useBlobUrl(open && receiptId ? loadPreview : null);
  const error = failed ? "Could not load preview." : null;

  const isPdf = receipt?.mimeType === "application/pdf";
  const isImage = receipt?.mimeType.startsWith("image/") ?? false;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={receipt?.fileName ?? "Receipt preview"}
      description={
        receipt ? `Added ${formatReceiptAddedDate(receipt.createdAt)}` : undefined
      }
      className="w-[min(100%-2rem,48rem)]"
    >
      {receipt ? (
        <div className="mb-4">
          <ReceiptEditableNotes receiptId={receipt.id} notes={receipt.notes} />
        </div>
      ) : null}

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {!error && blobUrl && isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={blobUrl} alt={receipt?.fileName ?? "Receipt"} className="max-h-[70vh] w-full object-contain" />
      ) : null}
      {!error && blobUrl && isPdf ? (
        <iframe src={blobUrl} title={receipt?.fileName ?? "Receipt PDF"} className="h-[70vh] w-full rounded-lg border border-border-subtle" />
      ) : null}
      {!error && !blobUrl && open ? <p className="text-sm text-text-muted">Loading preview…</p> : null}
    </Modal>
  );
}
