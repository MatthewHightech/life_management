"use client";

import { useDroppable } from "@dnd-kit/core";
import type { FolderColor, FolderNamespace } from "@life/shared";
import { folderDropId } from "@life/shared";
import { getFolderColorOption } from "@/lib/folder-colors";
import { cn } from "@/lib/cn";

export type FolderTileData = {
  id: string;
  name: string;
  color: FolderColor;
  itemCount: number;
  childFolderCount: number;
};

type FolderTileProps = {
  namespace: FolderNamespace;
  folder: FolderTileData;
  onOpen: (folderId: string) => void;
  onFileDrop?: (folderId: string, files: FileList) => void;
};

export function FolderTile({ namespace, folder, onOpen, onFileDrop }: FolderTileProps) {
  const colors = getFolderColorOption(folder.color);
  const { isOver, setNodeRef } = useDroppable({
    id: folderDropId(namespace, folder.id),
    data: { namespace, folderId: folder.id, zone: "library" },
  });

  const itemCount = folder.itemCount + folder.childFolderCount;
  const itemLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onOpen(folder.id)}
      onDragOver={(event) => {
        if (!onFileDrop || !event.dataTransfer.types.includes("Files")) {
          return;
        }
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (!onFileDrop || !event.dataTransfer.files.length) {
          return;
        }
        event.preventDefault();
        onFileDrop(folder.id, event.dataTransfer.files);
      }}
      className={cn(
        "relative inline-flex w-fit shrink-0 flex-col gap-0.5 rounded-md rounded-tl-none border border-black/10 px-2.5 py-1.5 text-left shadow-sm transition",
        colors.swatch,
        isOver ? "ring-2 ring-primary/50" : "hover:brightness-[0.97]",
      )}
    >
      <span
        className={cn("absolute -top-1 left-0 h-1.5 w-5 rounded-t-sm border border-black/10 border-b-0", colors.swatch)}
        aria-hidden
      />
      <span className="truncate text-sm font-medium text-text-main">{folder.name}</span>
      <span className="text-[0.65rem] text-text-muted">{itemLabel}</span>
    </button>
  );
}
