"use client";

import { useDroppable } from "@dnd-kit/core";
import type { DragEvent } from "react";
import type { FolderColor, FolderNamespace } from "@life/shared";
import { folderDropId } from "@life/shared";
import { FolderActionsMenu } from "@/components/folders/folder-actions-menu";
import { getFolderColorOption } from "@/lib/folder-colors";
import { cn } from "@/lib/cn";

export type FolderTileData = {
  id: string;
  name: string;
  color: FolderColor;
  itemCount: number;
  childFolderCount: number;
};

export function useFolderDropTarget(
  namespace: FolderNamespace,
  folderId: string | null,
  onFileDrop?: (files: FileList) => void,
) {
  const { isOver, setNodeRef } = useDroppable({
    id: folderDropId(namespace, folderId),
    data: { namespace, folderId, zone: "library" },
  });

  const fileDropHandlers = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (onFileDrop && event.dataTransfer.types.includes("Files")) {
        event.preventDefault();
      }
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      if (onFileDrop && event.dataTransfer.files.length) {
        event.preventDefault();
        onFileDrop(event.dataTransfer.files);
      }
    },
  };

  return { isOver, setNodeRef, fileDropHandlers };
}

type FolderTileProps = {
  namespace: FolderNamespace;
  folder: FolderTileData;
  onOpen: (folderId: string) => void;
  onFileDrop?: (folderId: string, files: FileList) => void;
  onFolderDeleted?: (folderId: string) => void;
};

export function FolderTile({ namespace, folder, onOpen, onFileDrop, onFolderDeleted }: FolderTileProps) {
  const colors = getFolderColorOption(folder.color);
  const { isOver, setNodeRef, fileDropHandlers } = useFolderDropTarget(
    namespace,
    folder.id,
    onFileDrop && ((files) => onFileDrop(folder.id, files)),
  );

  const itemCount = folder.itemCount + folder.childFolderCount;
  const itemLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/folder relative inline-flex w-fit shrink-0 flex-col gap-0.5 rounded-md rounded-tl-none border border-black/10 pr-6 text-left shadow-sm transition",
        colors.swatch,
        isOver ? "ring-2 ring-primary/50" : "hover:brightness-[0.97]",
      )}
      {...fileDropHandlers}
    >
      <span
        className={cn("absolute -top-1 left-0 h-1.5 w-5 rounded-t-sm border border-black/10 border-b-0", colors.swatch)}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => onOpen(folder.id)}
        className="flex flex-col gap-0.5 px-2.5 py-1.5 text-left"
      >
        <span className="truncate text-sm font-medium text-text-main">{folder.name}</span>
        <span className="text-[0.65rem] text-text-muted">{itemLabel}</span>
      </button>
      <FolderActionsMenu namespace={namespace} folder={folder} onDeleted={onFolderDeleted} />
    </div>
  );
}
