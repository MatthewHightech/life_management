"use client";

import { FolderPlus, Plus } from "lucide-react";
import { forwardRef } from "react";
import { RecipeBreadcrumbs } from "@/components/meals/recipe-breadcrumbs";
import { RecipeFolderTile } from "@/components/meals/recipe-folder-tile";
import { RecipeRow } from "@/components/meals/recipe-row";
import type { MealRecipe, MealRecipeFolder } from "@/components/meals/types";
import { Button } from "@/components/ui/button";

type RecipeLibrarySectionProps = {
  folders: MealRecipeFolder[];
  recipes: MealRecipe[];
  breadcrumbPath: MealRecipeFolder[];
  onNavigateFolder: (folderId: string | null) => void;
  onCreate: () => void;
  onCreateFolder: () => void;
  onEdit: (recipe: MealRecipe) => void;
};

export const RecipeLibrarySection = forwardRef<HTMLElement, RecipeLibrarySectionProps>(
  function RecipeLibrarySection(
    {
      folders,
      recipes,
      breadcrumbPath,
      onNavigateFolder,
      onCreate,
      onCreateFolder,
      onEdit,
    },
    ref,
  ) {
    const isEmpty = folders.length === 0 && recipes.length === 0;

    return (
      <section ref={ref} className="rounded-xl border border-border-subtle bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-warm-amber/40 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Recipes</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={onCreateFolder} className="gap-1.5 px-3 py-1.5 text-xs">
            <FolderPlus className="h-4 w-4" />
            Add folder
          </Button>
          <Button type="button" onClick={onCreate} className="gap-1.5 px-3 py-1.5 text-xs">
            <Plus className="h-4 w-4" />
            Add recipe
          </Button>
        </div>
      </header>

      <RecipeBreadcrumbs path={breadcrumbPath} onNavigate={onNavigateFolder} />

      <div className="space-y-3 p-3">
        {folders.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {folders.map((folder) => (
              <RecipeFolderTile key={folder.id} folder={folder} onOpen={onNavigateFolder} />
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
