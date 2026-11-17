"use client";

import { useMutation } from "@apollo/client";
import {
  formatRecipeMultiplierLabel,
  scaleQuantityString,
  scaleServings,
} from "@life/shared";
import { Pencil } from "lucide-react";
import {
  RecipeMultiplierControl,
  toRecipeMultiplier,
} from "@/components/meals/recipe-multiplier-control";
import type { MealRecipe } from "@/components/meals/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { UpdateRecipeDocument } from "@/graphql";
import { formatQuantityAsFraction } from "@/lib/recipe-quantity";
import { MEAL_PLAN_REFETCH } from "@/lib/refetch-queries";

type RecipeViewModalProps = {
  recipe: MealRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (recipe: MealRecipe) => void;
  onRecipeUpdated?: (recipe: MealRecipe) => void;
};

function formatIngredientLine(
  ingredient: MealRecipe["ingredients"][number],
  multiplier: number,
): string {
  const quantity = formatQuantityAsFraction(scaleQuantityString(ingredient.quantity, multiplier));
  const amount = [quantity || null, ingredient.unit].filter(Boolean).join(" ").trim();
  if (!amount) {
    return ingredient.name;
  }
  return `${amount} ${ingredient.name}`;
}

function servingsDescription(recipe: MealRecipe): string {
  const multiplier = toRecipeMultiplier(recipe.recipeMultiplier);
  const scaled = scaleServings(recipe.servings, multiplier);
  const multiplierLabel = formatRecipeMultiplierLabel(multiplier);

  if (scaled == null) {
    return multiplier === 1 ? "Household recipe" : `Scaled ${multiplierLabel}`;
  }

  return `${scaled} servings · ${multiplierLabel}`;
}

export function RecipeViewModal({
  recipe,
  open,
  onOpenChange,
  onEdit,
  onRecipeUpdated,
}: RecipeViewModalProps) {
  const [updateRecipe, { loading }] = useMutation(UpdateRecipeDocument, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
    awaitRefetchQueries: true,
  });

  if (!recipe) {
    return null;
  }

  const currentRecipe = recipe;
  const multiplier = toRecipeMultiplier(currentRecipe.recipeMultiplier);

  async function handleMultiplierChange(next: number) {
    const result = await updateRecipe({
      variables: {
        id: currentRecipe.id,
        input: { recipeMultiplier: next },
      },
    });
    const updated = result.data?.updateRecipe as MealRecipe | undefined;
    if (updated && onRecipeUpdated) {
      onRecipeUpdated(updated);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={currentRecipe.name}
      description={servingsDescription(currentRecipe)}
      className="w-[min(100%-2rem,42rem)]"
      headerAction={
        <Button
          type="button"
          className="gap-1.5 px-3 py-1.5 text-xs"
          onClick={() => onEdit(currentRecipe)}
        >
          <Pencil className="h-4 w-4" />
          Edit Recipe
        </Button>
      }
    >
      <div className="space-y-6 text-sm text-text-main">
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Recipe multiplier
          </h3>
          <RecipeMultiplierControl
            size="sm"
            value={multiplier}
            disabled={loading}
            onChange={(next) => void handleMultiplierChange(next)}
          />
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Ingredients
          </h3>
          {currentRecipe.ingredients.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5">
              {currentRecipe.ingredients.map((ingredient) => (
                <li key={ingredient.id}>{formatIngredientLine(ingredient, multiplier)}</li>
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
          {currentRecipe.instructions?.trim() ? (
            <div className="whitespace-pre-wrap leading-relaxed text-text-main">
              {currentRecipe.instructions.trim()}
            </div>
          ) : (
            <p className="text-text-muted">No instructions listed.</p>
          )}
        </section>
      </div>
    </Modal>
  );
}
