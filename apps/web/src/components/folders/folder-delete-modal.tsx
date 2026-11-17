"use client";

import { useMutation } from "@apollo/client";
import { DeleteFolderDocument } from "@/graphql";
import type { FolderNamespace } from "@life/shared";
import { folderRefetchQueries } from "@/lib/refetch-queries";
import type { FolderTileData } from "@/components/folders/folder-tile";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type FolderDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namespace: FolderNamespace;
  folder: FolderTileData;
  onDeleted?: (folderId: string) => void;
};

export function FolderDeleteModal({
  open,
  onOpenChange,
  namespace,
  folder,
  onDeleted,
}: FolderDeleteModalProps) {
  const [deleteFolder, { loading }] = useMutation(DeleteFolderDocument, {
    refetchQueries: folderRefetchQueries(namespace),
    awaitRefetchQueries: true,
    onCompleted: () => {
      onDeleted?.(folder.id);
      onOpenChange(false);
    },
  });

  const hasContents = folder.itemCount + folder.childFolderCount > 0;

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete folder?"
      description={
        hasContents
          ? `"${folder.name}" and any subfolders will be deleted. Items inside will move to the parent folder or the library root.`
          : `"${folder.name}" will be permanently deleted.`
      }
      confirmLabel="Delete"
      loadingLabel="Deleting…"
      loading={loading}
      onConfirm={() => void deleteFolder({ variables: { id: folder.id } })}
    />
  );
}
