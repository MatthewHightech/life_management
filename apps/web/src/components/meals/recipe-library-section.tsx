"use client";

import { Plus } from "lucide-react";
import { RecipeRow } from "@/components/meals/recipe-row";
import type { MealRecipe } from "@/components/meals/types";
import { Button } from "@/components/ui/button";

type RecipeLibrarySectionProps = {
  recipes: MealRecipe[];
  onCreate: () => void;
  onEdit: (recipe: MealRecipe) => void;
};

export function RecipeLibrarySection({ recipes, onCreate, onEdit }: RecipeLibrarySectionProps) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface">
      <header className="flex items-center justify-between border-b border-border-subtle bg-warm-amber/40 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Recipes</h2>
        <Button type="button" onClick={onCreate} className="gap-1.5 px-3 py-1.5 text-xs">
          <Plus className="h-4 w-4" />
          Add recipe
        </Button>
      </header>

      <div className="space-y-2 p-3">
        {recipes.length === 0 ? (
          <p className="text-sm text-text-muted">Add a recipe, then drag it onto a meal slot below.</p>
        ) : (
          recipes.map((recipe) => <RecipeRow key={recipe.id} recipe={recipe} onEdit={onEdit} />)
        )}
      </div>
    </section>
  );
}
