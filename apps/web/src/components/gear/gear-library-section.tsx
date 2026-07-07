"use client";

import { FolderPlus, Plus } from "lucide-react";
import { forwardRef } from "react";
import { FolderBreadcrumbs } from "@/components/folders/folder-breadcrumbs";
import { FolderTile } from "@/components/folders/folder-tile";
import { GearClassRow } from "@/components/gear/gear-class-row";
import { GearItemRow } from "@/components/gear/gear-item-row";
import type { GearFolder, GearItem, GearItemClass } from "@/components/gear/types";
import { Button } from "@/components/ui/button";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { cn } from "@/lib/cn";

type GearLibrarySectionProps = {
  folders: GearFolder[];
  items: GearItem[];
  classes: GearItemClass[];
  breadcrumbPath: GearFolder[];
  currentFolderId: string | null;
  expandedClassIds: Set<string>;
  onNavigateFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onCreateItem: () => void;
  onCreateClass: () => void;
  onEditItem: (item: GearItem) => void;
  onDeleteItem: (item: GearItem) => void;
  onToggleClassExpand: (classId: string) => void;
  onEditClass: (itemClass: GearItemClass) => void;
  onDeleteClass: (itemClass: GearItemClass) => void;
  onAddVariant: (itemClass: GearItemClass) => void;
  addingVariantClassId: string | null;
  onCancelAddVariant: () => void;
  onDeleteVariant: (itemClass: GearItemClass, variantId: string) => void;
  onFolderDeleted?: (folderId: string) => void;
};

export const GearLibrarySection = forwardRef<HTMLElement, GearLibrarySectionProps>(
  function GearLibrarySection(
    {
      folders,
      items,
      classes,
      breadcrumbPath,
      currentFolderId,
      expandedClassIds,
      onNavigateFolder,
      onCreateFolder,
      onCreateItem,
      onCreateClass,
      onEditItem,
      onDeleteItem,
      onToggleClassExpand,
      onEditClass,
      onDeleteClass,
      onAddVariant,
      addingVariantClassId,
      onCancelAddVariant,
      onDeleteVariant,
      onFolderDeleted,
    },
    ref,
  ) {
    const isEmpty = folders.length === 0 && items.length === 0 && classes.length === 0;
    const showBreadcrumbs = breadcrumbPath.length > 0;

    return (
      <section ref={ref} className={sectionCardClass}>
        <header className={cn(sectionHeaderClass, "flex flex-wrap items-center justify-between gap-2")}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Gear library</h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={onCreateFolder} className="gap-1.5 px-3 py-1.5 text-xs">
              <FolderPlus className="h-4 w-4" />
              Add folder
            </Button>
            <Button type="button" variant="ghost" onClick={onCreateClass} className="gap-1.5 px-3 py-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add class
            </Button>
            <Button type="button" onClick={onCreateItem} className="gap-1.5 px-3 py-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
        </header>

        {showBreadcrumbs ? (
          <FolderBreadcrumbs
            namespace="GEAR"
            rootLabel="Gear"
            path={breadcrumbPath}
            onNavigate={onNavigateFolder}
          />
        ) : null}

        <div className="space-y-3 p-3">
          {folders.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {folders.map((folder) => (
                <FolderTile
                  key={folder.id}
                  namespace="GEAR"
                  folder={{
                    id: folder.id,
                    name: folder.name,
                    color: folder.color,
                    itemCount: folder.itemCount,
                    childFolderCount: folder.childFolderCount,
                  }}
                  onOpen={onNavigateFolder}
                  onFolderDeleted={onFolderDeleted}
                />
              ))}
            </div>
          ) : null}

          {classes.length > 0 ? (
            <div className="space-y-2">
              {classes.map((itemClass) => (
                <GearClassRow
                  key={itemClass.id}
                  itemClass={itemClass}
                  expanded={expandedClassIds.has(itemClass.id)}
                  isAddingVariant={addingVariantClassId === itemClass.id}
                  onToggleExpand={onToggleClassExpand}
                  onEdit={onEditClass}
                  onDelete={onDeleteClass}
                  onAddVariant={onAddVariant}
                  onCancelAddVariant={onCancelAddVariant}
                  onDeleteVariant={(variant) => onDeleteVariant(itemClass, variant.id)}
                />
              ))}
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <GearItemRow
                  key={item.id}
                  item={item}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          ) : null}

          {isEmpty ? (
            <p className="text-sm text-text-muted">
              Add folders, standalone items, or item classes to start tracking gear.
            </p>
          ) : null}
        </div>
      </section>
    );
  },
);
