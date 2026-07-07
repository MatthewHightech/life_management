"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReceiptItem } from "@/components/receipts/types";
import { fetchReceiptBlob } from "@/lib/receipt-upload";
import { formatReceiptRowSubtitle } from "@/lib/receipt-display";
import { cn } from "@/lib/cn";

type ReceiptRowProps = {
  receipt: ReceiptItem;
  onPreview: (receipt: ReceiptItem) => void;
  onRename: (receipt: ReceiptItem) => void;
  onDelete: (receipt: ReceiptItem) => void;
  overlay?: boolean;
};

export function ReceiptRow({ receipt, onPreview, onRename, onDelete, overlay = false }: ReceiptRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: receipt.id,
    data: { receiptId: receipt.id },
    disabled: overlay,
  });

  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const isImage = receipt.mimeType.startsWith("image/");
  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };

  useEffect(() => {
    if (!isImage || overlay) {
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
        setThumbUrl(objectUrl);
      })
      .catch(() => {
        if (active) {
          setThumbUrl(null);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isImage, overlay, receipt.id]);

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 shadow-sm",
        isDragging && "opacity-0",
        overlay && "cursor-grabbing shadow-lg",
      )}
    >
      {!overlay ? (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="shrink-0 cursor-grab rounded p-0.5 text-text-muted hover:text-text-main active:cursor-grabbing"
          aria-label={`Drag ${receipt.fileName}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      ) : (
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      )}

      <button
        type="button"
        onClick={() => onPreview(receipt)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-background">
          {thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <FileText className="h-5 w-5 text-text-muted" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-text-main">{receipt.fileName}</span>
          <span className="block truncate text-xs text-text-muted">
            {formatReceiptRowSubtitle(receipt.createdAt, receipt.notes)}
          </span>
        </span>
      </button>

      {!overlay ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onRename(receipt)}
            className="rounded p-1 text-text-muted hover:bg-background hover:text-text-main"
            aria-label={`Rename ${receipt.fileName}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(receipt)}
            className="rounded p-1 text-text-muted hover:bg-background hover:text-error"
            aria-label={`Delete ${receipt.fileName}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </article>
  );
}
