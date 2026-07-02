"use client";

import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ReceiptUploadZoneProps = {
  onUpload: (files: FileList, folderId: string | null) => Promise<void>;
  folderId: string | null;
  uploading?: boolean;
};

export function ReceiptUploadZone({ onUpload, folderId, uploading = false }: ReceiptUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length || uploading) {
      return;
    }

    setError(null);

    try {
      await onUpload(files, folderId);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    }
  }

  return (
    <div className="border-b border-border-subtle px-4 py-3">
      <div
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) {
            return;
          }
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition",
          dragOver ? "border-primary bg-sage-green/60" : "border-border-subtle bg-sage-green/30",
        )}
      >
        <FileUp className="h-8 w-8 text-text-muted" />
        <p className="text-sm text-text-main">Drag images or PDFs here</p>
        <p className="text-xs text-text-muted">Up to 10 MB per file</p>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Choose files"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>
      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
    </div>
  );
}
