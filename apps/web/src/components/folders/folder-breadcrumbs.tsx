"use client";

import { useDroppable } from "@dnd-kit/core";
import { ChevronRight } from "lucide-react";
import type { FolderNamespace } from "@life/shared";
import { folderDropId } from "@life/shared";
import { cn } from "@/lib/cn";
import type { FolderTileData } from "@/components/folders/folder-tile";

type FolderBreadcrumbsProps = {
  namespace: FolderNamespace;
  rootLabel: string;
  path: FolderTileData[];
  onNavigate: (folderId: string | null) => void;
  onFileDrop?: (folderId: string | null, files: FileList) => void;
};

function BreadcrumbDropTarget({
  namespace,
  folderId,
  label,
  onNavigate,
  onFileDrop,
  isLast,
}: {
  namespace: FolderNamespace;
  folderId: string | null;
  label: string;
  onNavigate: (folderId: string | null) => void;
  onFileDrop?: (folderId: string | null, files: FileList) => void;
  isLast?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: folderDropId(namespace, folderId),
    data: { namespace, folderId, zone: "library" },
  });

  return (
    <li className="flex min-w-0 items-center gap-1">
      {!isLast ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden /> : null}
      <button
        ref={setNodeRef}
        type="button"
        onClick={() => onNavigate(folderId)}
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
          onFileDrop(folderId, event.dataTransfer.files);
        }}
        className={cn(
          "truncate rounded px-1 py-0.5 text-sm transition",
          isLast ? "font-medium text-text-main" : "text-text-muted hover:text-text-main",
          isOver && "bg-primary/10 text-primary",
        )}
        aria-current={isLast ? "page" : undefined}
      >
        {label}
      </button>
    </li>
  );
}

export function FolderBreadcrumbs({
  namespace,
  rootLabel,
  path,
  onNavigate,
  onFileDrop,
}: FolderBreadcrumbsProps) {
  return (
    <nav aria-label="Folders" className="border-b border-border-subtle px-4 py-2">
      <ol className="flex min-w-0 flex-wrap items-center gap-1">
        <BreadcrumbDropTarget
          namespace={namespace}
          folderId={null}
          label={rootLabel}
          onNavigate={onNavigate}
          onFileDrop={onFileDrop}
          isLast={path.length === 0}
        />
        {path.map((folder, index) => (
          <BreadcrumbDropTarget
            key={folder.id}
            namespace={namespace}
            folderId={folder.id}
            label={folder.name}
            onNavigate={onNavigate}
            onFileDrop={onFileDrop}
            isLast={index === path.length - 1}
          />
        ))}
      </ol>
    </nav>
  );
}
