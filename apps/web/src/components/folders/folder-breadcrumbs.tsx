"use client";

import { ChevronRight } from "lucide-react";
import type { FolderNamespace } from "@life/shared";
import { cn } from "@/lib/cn";
import { useFolderDropTarget, type FolderTileData } from "@/components/folders/folder-tile";

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
  isLast: boolean;
}) {
  const { isOver, setNodeRef, fileDropHandlers } = useFolderDropTarget(
    namespace,
    folderId,
    onFileDrop && ((files) => onFileDrop(folderId, files)),
  );

  return (
    <li className="flex min-w-0 items-center gap-1">
      {!isLast ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden /> : null}
      <button
        ref={setNodeRef}
        type="button"
        onClick={() => onNavigate(folderId)}
        {...fileDropHandlers}
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
  const crumbs = [{ id: null, name: rootLabel }, ...path];

  return (
    <nav aria-label="Folders" className="border-b border-border-subtle px-4 py-2">
      <ol className="flex min-w-0 flex-wrap items-center gap-1">
        {crumbs.map((crumb, index) => (
          <BreadcrumbDropTarget
            key={crumb.id ?? "root"}
            namespace={namespace}
            folderId={crumb.id}
            label={crumb.name}
            onNavigate={onNavigate}
            onFileDrop={onFileDrop}
            isLast={index === crumbs.length - 1}
          />
        ))}
      </ol>
    </nav>
  );
}
