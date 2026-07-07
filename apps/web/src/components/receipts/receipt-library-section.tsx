"use client";

import { FolderPlus } from "lucide-react";
import { forwardRef } from "react";
import { FolderBreadcrumbs } from "@/components/folders/folder-breadcrumbs";
import { FolderTile } from "@/components/folders/folder-tile";
import { ReceiptRow } from "@/components/receipts/receipt-row";
import { ReceiptUploadZone } from "@/components/receipts/receipt-upload-zone";
import type { ReceiptFolder, ReceiptItem } from "@/components/receipts/types";
import { Button } from "@/components/ui/button";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { cn } from "@/lib/cn";

type ReceiptLibrarySectionProps = {
  folders: ReceiptFolder[];
  receipts: ReceiptItem[];
  breadcrumbPath: ReceiptFolder[];
  currentFolderId: string | null;
  uploading: boolean;
  onNavigateFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onUpload: (files: FileList, folderId: string | null) => Promise<void>;
  onPreview: (receipt: ReceiptItem) => void;
  onRename: (receipt: ReceiptItem) => void;
  onDelete: (receipt: ReceiptItem) => void;
  onFolderDeleted?: (folderId: string) => void;
};

export const ReceiptLibrarySection = forwardRef<HTMLElement, ReceiptLibrarySectionProps>(
  function ReceiptLibrarySection(
    {
      folders,
      receipts,
      breadcrumbPath,
      currentFolderId,
      uploading,
      onNavigateFolder,
      onCreateFolder,
      onUpload,
      onPreview,
      onRename,
      onDelete,
      onFolderDeleted,
    },
    ref,
  ) {
    const isEmpty = folders.length === 0 && receipts.length === 0;

    return (
      <section ref={ref} className={sectionCardClass}>
        <header className={cn(sectionHeaderClass, "flex flex-wrap items-center justify-between gap-2")}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Receipts</h2>
          <Button type="button" variant="ghost" onClick={onCreateFolder} className="gap-1.5 px-3 py-1.5 text-xs">
            <FolderPlus className="h-4 w-4" />
            Add folder
          </Button>
        </header>

        <ReceiptUploadZone
          onUpload={onUpload}
          folderId={currentFolderId}
          uploading={uploading}
        />

        <FolderBreadcrumbs
          namespace="RECEIPTS"
          rootLabel="Receipts"
          path={breadcrumbPath}
          onNavigate={onNavigateFolder}
          onFileDrop={(folderId, files) => void onUpload(files, folderId)}
        />

        <div className="space-y-3 p-3">
          {folders.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {folders.map((folder) => (
                <FolderTile
                  key={folder.id}
                  namespace="RECEIPTS"
                  folder={{
                    id: folder.id,
                    name: folder.name,
                    color: folder.color,
                    itemCount: folder.itemCount,
                    childFolderCount: folder.childFolderCount,
                  }}
                  onOpen={onNavigateFolder}
                  onFileDrop={(folderId, files) => void onUpload(files, folderId)}
                  onFolderDeleted={onFolderDeleted}
                />
              ))}
            </div>
          ) : null}

          {receipts.length > 0 ? (
            <div className="space-y-2">
              {receipts.map((receipt) => (
                <ReceiptRow
                  key={receipt.id}
                  receipt={receipt}
                  onPreview={onPreview}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : null}

          {isEmpty ? (
            <p className="text-sm text-text-muted">Upload receipts or add folders to get started.</p>
          ) : null}
        </div>
      </section>
    );
  },
);
