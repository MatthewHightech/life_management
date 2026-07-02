"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { UPDATE_FOLDER_MUTATION } from "@/graphql";
import type { FolderNamespace } from "@life/shared";
import { folderRefetchQueries } from "@/lib/folder-queries";
import type { FolderTileData } from "@/components/folders/folder-tile";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type FolderRenameModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namespace: FolderNamespace;
  folder: FolderTileData | null;
};

export function FolderRenameModal({ open, onOpenChange, namespace, folder }: FolderRenameModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open && folder) {
      setName(folder.name);
    }
  }, [open, folder]);

  const [updateFolder, { loading }] = useMutation(UPDATE_FOLDER_MUTATION, {
    refetchQueries: folderRefetchQueries(namespace),
    awaitRefetchQueries: true,
    onCompleted: () => onOpenChange(false),
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!folder) {
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    await updateFolder({
      variables: {
        id: folder.id,
        input: { name: trimmed },
      },
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Rename folder" className="w-[min(100%-2rem,28rem)]">
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Folder name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            required
            autoFocus
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
