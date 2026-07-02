"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ReceiptLibraryQuery } from "@/graphql";
import { MOVE_RECEIPT_TO_FOLDER_MUTATION, RECEIPT_LIBRARY_QUERY } from "@/graphql";
import { ReceiptDeleteModal } from "@/components/receipts/receipt-delete-modal";
import { ReceiptLibrarySection } from "@/components/receipts/receipt-library-section";
import { ReceiptPreviewModal } from "@/components/receipts/receipt-preview-modal";
import { ReceiptRenameModal } from "@/components/receipts/receipt-rename-modal";
import { ReceiptRow } from "@/components/receipts/receipt-row";
import type { ReceiptItem } from "@/components/receipts/types";
import { FolderFormModal } from "@/components/folders/folder-form-modal";
import { ModulePageLayout } from "@/components/shell/module-page-layout";
import { createLibraryCollisionDetection } from "@/lib/folder-dnd";
import {
  buildFolderPath,
  filterFoldersForParent,
  filterItemsForFolder,
  folderIdAfterDelete,
} from "@/lib/folder-utils";
import { RECEIPT_LIBRARY_REFETCH } from "@/lib/receipt-queries";
import { uploadReceiptFiles } from "@/lib/receipt-upload";
import { parseFolderDropId } from "@life/shared";

type ReceiptLibraryData = ReceiptLibraryQuery["receiptLibrary"];

export function ReceiptManagementPage() {
  const libraryZoneRef = useRef<HTMLElement>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptItem | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptItem | null>(null);
  const [renameReceipt, setRenameReceipt] = useState<ReceiptItem | null>(null);
  const [deleteReceipt, setDeleteReceipt] = useState<ReceiptItem | null>(null);

  const { data, loading, error, refetch } = useQuery<ReceiptLibraryQuery>(RECEIPT_LIBRARY_QUERY);
  const [moveReceiptToFolder] = useMutation(MOVE_RECEIPT_TO_FOLDER_MUTATION, {
    refetchQueries: [...RECEIPT_LIBRARY_REFETCH],
    awaitRefetchQueries: true,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const collisionDetection = useMemo(
    () =>
      createLibraryCollisionDetection("RECEIPTS", () => libraryZoneRef.current?.getBoundingClientRect() ?? null),
    [],
  );

  const library: ReceiptLibraryData | undefined = data?.receiptLibrary;

  const receiptById = useMemo(
    () => new Map(library?.receipts.map((receipt) => [receipt.id, receipt]) ?? []),
    [library?.receipts],
  );

  const breadcrumbPath = useMemo(
    () => buildFolderPath(library?.folders ?? [], currentFolderId),
    [library?.folders, currentFolderId],
  );

  const visibleFolders = useMemo(
    () => filterFoldersForParent(library?.folders ?? [], currentFolderId),
    [library?.folders, currentFolderId],
  );

  const visibleReceipts = useMemo(
    () => filterItemsForFolder(library?.receipts ?? [], currentFolderId),
    [library?.receipts, currentFolderId],
  );

  const handleNavigateFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
  }, []);

  const handleFolderDeleted = useCallback(
    (deletedFolderId: string) => {
      setCurrentFolderId((currentId) =>
        folderIdAfterDelete(library?.folders ?? [], currentId, deletedFolderId),
      );
    },
    [library?.folders],
  );

  const handleUpload = useCallback(
    async (files: FileList, folderId: string | null) => {
      setUploading(true);
      try {
        await uploadReceiptFiles(Array.from(files), folderId);
        await refetch();
      } finally {
        setUploading(false);
      }
    },
    [refetch],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveReceipt(null);

    if (!over) {
      return;
    }

    const receiptId = String(active.id);
    if (!receiptById.has(receiptId)) {
      return;
    }

    const folderTarget = parseFolderDropId(String(over.id));
    if (!folderTarget || folderTarget.namespace !== "RECEIPTS") {
      return;
    }

    const receipt = receiptById.get(receiptId);
    if ((receipt?.folderId ?? null) === folderTarget.folderId) {
      return;
    }

    void moveReceiptToFolder({
      variables: {
        receiptId,
        folderId: folderTarget.folderId,
      },
    });
  }

  return (
    <ModulePageLayout title="Receipt Management">
      {loading && <p className="text-sm text-text-muted">Loading receipts…</p>}
      {error && <p className="text-sm text-error">Could not load receipts: {error.message}</p>}

      {!loading && !error && library && (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={(event) => {
            const receipt = receiptById.get(String(event.active.id));
            setActiveReceipt(receipt ?? null);
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveReceipt(null)}
        >
          <ReceiptLibrarySection
            ref={libraryZoneRef}
            folders={visibleFolders}
            receipts={visibleReceipts}
            breadcrumbPath={breadcrumbPath}
            currentFolderId={currentFolderId}
            uploading={uploading}
            onNavigateFolder={handleNavigateFolder}
            onCreateFolder={() => setFolderModalOpen(true)}
            onUpload={handleUpload}
            onPreview={setPreviewReceipt}
            onRename={setRenameReceipt}
            onDelete={setDeleteReceipt}
            onFolderDeleted={handleFolderDeleted}
          />

          <DragOverlay dropAnimation={null}>
            {activeReceipt ? (
              <ReceiptRow
                receipt={activeReceipt}
                onPreview={() => undefined}
                onRename={() => undefined}
                onDelete={() => undefined}
                overlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <FolderFormModal
        open={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        namespace="RECEIPTS"
        parentId={currentFolderId}
        refetchQueries={[...RECEIPT_LIBRARY_REFETCH]}
      />
      <ReceiptPreviewModal
        open={Boolean(previewReceipt)}
        onOpenChange={(open) => !open && setPreviewReceipt(null)}
        receipt={previewReceipt}
      />
      <ReceiptRenameModal
        open={Boolean(renameReceipt)}
        onOpenChange={(open) => !open && setRenameReceipt(null)}
        receipt={renameReceipt}
      />
      <ReceiptDeleteModal
        open={Boolean(deleteReceipt)}
        onOpenChange={(open) => !open && setDeleteReceipt(null)}
        receipt={deleteReceipt}
      />
    </ModulePageLayout>
  );
}
