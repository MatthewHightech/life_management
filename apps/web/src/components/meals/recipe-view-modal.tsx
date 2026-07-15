"use client";

import { Pencil } from "lucide-react";
import type { MealRecipe } from "@/components/meals/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatQuantityAsFraction } from "@/lib/recipe-quantity";

type RecipeViewModalProps = {
  recipe: MealRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (recipe: MealRecipe) => void;
};

function formatIngredientLine(ingredient: MealRecipe["ingredients"][number]): string {
  const quantity = formatQuantityAsFraction(ingredient.quantity);
  const amount = [quantity || null, ingredient.unit].filter(Boolean).join(" ").trim();
  if (!amount) {
    return ingredient.name;
  }
  return `${amount} ${ingredient.name}`;
}

export function RecipeViewModal({ recipe, open, onOpenChange, onEdit }: RecipeViewModalProps) {
  if (!recipe) {
    return null;
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={recipe.name}
      description={recipe.servings ? `${recipe.servings} servings` : "Household recipe"}
      className="w-[min(100%-2rem,42rem)]"
      headerAction={
        <Button
          type="button"
          className="gap-1.5 px-3 py-1.5 text-xs"
          onClick={() => onEdit(recipe)}
        >
          <Pencil className="h-4 w-4" />
          Edit Recipe
        </Button>
      }
    >
      <div className="space-y-6 text-sm text-text-main">
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Ingredients
          </h3>
          {recipe.ingredients.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id}>{formatIngredientLine(ingredient)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted">No ingredients listed.</p>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Instructions
          </h3>
          {recipe.instructions?.trim() ? (
            <div className="whitespace-pre-wrap leading-relaxed text-text-main">
              {recipe.instructions.trim()}
            </div>
          ) : (
            <p className="text-text-muted">No instructions listed.</p>
          )}
        </section>
      </div>
    </Modal>
  );
}
