"use client";

import { useEffect, useState } from "react";
import type { ReceiptItem } from "@/components/receipts/types";
import { fetchReceiptBlob } from "@/lib/receipt-upload";
import { Modal } from "@/components/ui/modal";

type ReceiptPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: ReceiptItem | null;
};

export function ReceiptPreviewModal({ open, onOpenChange, receipt }: ReceiptPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !receipt) {
      setBlobUrl(null);
      setError(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    void fetchReceiptBlob(receipt.id)
      .then((blob) => {
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (active) {
          setError("Could not load preview.");
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [open, receipt]);

  const isPdf = receipt?.mimeType === "application/pdf";
  const isImage = receipt?.mimeType.startsWith("image/") ?? false;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={receipt?.fileName ?? "Receipt preview"}
      className="w-[min(100%-2rem,48rem)]"
    >
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
