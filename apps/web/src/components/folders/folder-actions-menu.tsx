"use client";

import { MoreHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import type { FolderNamespace } from "@life/shared";
import { FolderDeleteModal } from "@/components/folders/folder-delete-modal";
import { FolderRenameModal } from "@/components/folders/folder-rename-modal";
import type { FolderTileData } from "@/components/folders/folder-tile";
import { FloatingPanel } from "@/components/ui/floating-panel";
import { cn } from "@/lib/cn";

type FolderActionsMenuProps = {
  namespace: FolderNamespace;
  folder: FolderTileData;
  onDeleted?: (folderId: string) => void;
};

export function FolderActionsMenu({ namespace, folder, onDeleted }: FolderActionsMenuProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setMenuOpen((open) => !open);
        }}
        className={cn(
          "absolute right-1 top-1 rounded p-0.5 text-text-muted opacity-0 transition hover:bg-black/5 hover:text-text-main focus:opacity-100 group-hover/folder:opacity-100 group-focus-within/folder:opacity-100",
          menuOpen && "opacity-100",
        )}
        aria-label={`Folder options for ${folder.name}`}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      <FloatingPanel open={menuOpen} anchorRef={anchorRef} onClose={() => setMenuOpen(false)}>
        <div className="py-1">
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-text-main hover:bg-surface-container"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(false);
              setRenameOpen(true);
            }}
          >
            Rename
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-error hover:bg-surface-container"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(false);
              setDeleteOpen(true);
            }}
          >
            Delete
          </button>
        </div>
      </FloatingPanel>

      <FolderRenameModal
        open={renameOpen}
        onOpenChange={setRenameOpen}
        namespace={namespace}
        folder={folder}
      />
      <FolderDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        namespace={namespace}
        folder={folder}
        onDeleted={onDeleted}
      />
    </>
  );
}
