"use client";

import { FolderPlus, Plus } from "lucide-react";
import { forwardRef } from "react";
import { FolderBreadcrumbs } from "@/components/folders/folder-breadcrumbs";
import { FolderTile } from "@/components/folders/folder-tile";
import { RecipeRow } from "@/components/meals/recipe-row";
import type { MealFolder, MealRecipe } from "@/components/meals/types";
import { Button } from "@/components/ui/button";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { cn } from "@/lib/cn";

type RecipeLibrarySectionProps = {
  folders: MealFolder[];
  recipes: MealRecipe[];
  breadcrumbPath: MealFolder[];
  onNavigateFolder: (folderId: string | null) => void;
  onCreate: () => void;
  onImport: () => void;
  onCreateFolder: () => void;
  onEdit: (recipe: MealRecipe) => void;
  onFolderDeleted?: (folderId: string) => void;
};

export const RecipeLibrarySection = forwardRef<HTMLElement, RecipeLibrarySectionProps>(
  function RecipeLibrarySection(
    {
      folders,
      recipes,
      breadcrumbPath,
      onNavigateFolder,
      onCreate,
      onImport,
      onCreateFolder,
      onEdit,
      onFolderDeleted,
    },
    ref,
  ) {
    const isEmpty = folders.length === 0 && recipes.length === 0;

    return (
      <section ref={ref} className={sectionCardClass}>
        <header className={cn(sectionHeaderClass, "flex flex-wrap items-center justify-between gap-2")}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Recipes</h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={onCreateFolder} className="gap-1.5 px-3 py-1.5 text-xs">
              <FolderPlus className="h-4 w-4" />
              Add folder
            </Button>
            <Button type="button" variant="secondary" onClick={onImport} className="px-3 py-1.5 text-xs">
              Import from URL
            </Button>
            <Button type="button" onClick={onCreate} className="gap-1.5 px-3 py-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add recipe
            </Button>
          </div>
        </header>

        <FolderBreadcrumbs
          namespace="MEALS"
          rootLabel="Recipes"
          path={breadcrumbPath}
          onNavigate={onNavigateFolder}
        />

        <div className="space-y-3 p-3">
          {folders.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {folders.map((folder) => (
                <FolderTile
                  key={folder.id}
                  namespace="MEALS"
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

          {recipes.length > 0 ? (
            <div className="space-y-2">
              {recipes.map((recipe) => (
                <RecipeRow key={recipe.id} recipe={recipe} onEdit={onEdit} />
              ))}
            </div>
          ) : null}

          {isEmpty ? (
            <p className="text-sm text-text-muted">
              Add folders to organize recipes, then drag them onto meal slots below.
            </p>
          ) : null}
        </div>
      </section>
    );
  },
);
