"use client";

import { useMutation } from "@apollo/client";
import { UpdateFolderDocument } from "@/graphql";
import type { FolderNamespace } from "@life/shared";
import { folderRefetchQueries } from "@/lib/refetch-queries";
import type { FolderTileData } from "@/components/folders/folder-tile";
import { RenameModal } from "@/components/ui/rename-modal";

type FolderRenameModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namespace: FolderNamespace;
  folder: FolderTileData;
};

export function FolderRenameModal({ open, onOpenChange, namespace, folder }: FolderRenameModalProps) {
  const [updateFolder, { loading }] = useMutation(UpdateFolderDocument, {
    refetchQueries: folderRefetchQueries(namespace),
    awaitRefetchQueries: true,
    onCompleted: () => onOpenChange(false),
  });

  return (
    <RenameModal
      open={open}
      onOpenChange={onOpenChange}
      title="Rename folder"
      label="Folder name"
      initialName={folder.name}
      loading={loading}
      onSubmit={(name) => updateFolder({ variables: { id: folder.id, input: { name } } })}
    />
  );
}
