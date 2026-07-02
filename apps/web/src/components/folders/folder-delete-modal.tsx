"use client";

import { useMutation } from "@apollo/client";
import { DELETE_FOLDER_MUTATION } from "@/graphql";
import type { FolderNamespace } from "@life/shared";
import { folderRefetchQueries } from "@/lib/folder-queries";
import type { FolderTileData } from "@/components/folders/folder-tile";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type FolderDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namespace: FolderNamespace;
  folder: FolderTileData | null;
  onDeleted?: (folderId: string) => void;
};

export function FolderDeleteModal({
  open,
  onOpenChange,
  namespace,
  folder,
  onDeleted,
}: FolderDeleteModalProps) {
  const [deleteFolder, { loading }] = useMutation(DELETE_FOLDER_MUTATION, {
    refetchQueries: folderRefetchQueries(namespace),
    awaitRefetchQueries: true,
    onCompleted: () => {
      if (folder) {
        onDeleted?.(folder.id);
      }
      onOpenChange(false);
    },
  });

  const hasContents = folder ? folder.itemCount + folder.childFolderCount > 0 : false;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete folder?"
      description={
        folder
          ? hasContents
            ? `"${folder.name}" and any subfolders will be deleted. Items inside will move to the parent folder or the library root.`
            : `"${folder.name}" will be permanently deleted.`
          : undefined
      }
    >
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={loading || !folder}
          onClick={() => folder && void deleteFolder({ variables: { id: folder.id } })}
        >
          {loading ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
