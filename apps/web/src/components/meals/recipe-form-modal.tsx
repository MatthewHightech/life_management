"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { CREATE_RECIPE_MUTATION, UPDATE_RECIPE_MUTATION } from "@/graphql";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { MealRecipe, RecipeFormValues } from "@/components/meals/types";
import { cn } from "@/lib/cn";

const emptyIngredient = { name: "", quantity: "", unit: "" };

function toFormValues(recipe?: MealRecipe | null): RecipeFormValues {
  if (!recipe) {
    return {
      name: "",
      instructions: "",
      servings: "",
      ingredients: [{ ...emptyIngredient }],
    };
  }

  return {
    name: recipe.name,
    instructions: recipe.instructions ?? "",
    servings: recipe.servings?.toString() ?? "",
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity ?? "",
            unit: ingredient.unit ?? "",
          }))
        : [{ ...emptyIngredient }],
  };
}

type RecipeFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe?: MealRecipe | null;
  folderId?: string | null;
  /** Prefill for create (e.g. URL import). Ignored when editing an existing recipe. */
  initialValues?: RecipeFormValues | null;
  /** Called with the saved recipe instead of only closing (e.g. return to view modal). */
  onSaved?: (recipe: MealRecipe) => void;
};

export function RecipeFormModal({
  open,
  onOpenChange,
  recipe,
  folderId = null,
  initialValues = null,
  onSaved,
}: RecipeFormModalProps) {
  const [form, setForm] = useState<RecipeFormValues>(() => toFormValues(recipe));
  const isEdit = Boolean(recipe);

  useEffect(() => {
    if (open) {
      setForm(recipe ? toFormValues(recipe) : (initialValues ?? toFormValues(null)));
    }
  }, [open, recipe, initialValues]);

  const [createRecipe, { loading: creating }] = useMutation(CREATE_RECIPE_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
    awaitRefetchQueries: true,
  });

  const [updateRecipe, { loading: updating }] = useMutation(UPDATE_RECIPE_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
    awaitRefetchQueries: true,
  });

  const loading = creating || updating;

  function updateIngredient(index: number, field: "name" | "quantity" | "unit", value: string) {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const ingredients = form.ingredients
      .map((ingredient) => ({
        name: ingredient.name.trim(),
        quantity: ingredient.quantity?.trim() || null,
        unit: ingredient.unit?.trim() || null,
      }))
      .filter((ingredient) => ingredient.name);

    if (!form.name.trim() || ingredients.length === 0) {
      return;
    }

    const input = {
      name: form.name.trim(),
      instructions: form.instructions.trim() || null,
      servings: form.servings.trim() ? Number(form.servings) : null,
      ingredients,
    };

    if (isEdit && recipe) {
      const result = await updateRecipe({ variables: { id: recipe.id, input } });
      const saved = result.data?.updateRecipe as MealRecipe | undefined;
      if (saved && onSaved) {
        onSaved(saved);
        return;
      }
      onOpenChange(false);
      return;
    }

    const result = await createRecipe({
      variables: {
        input: {
          ...input,
          folderId,
        },
      },
    });
    const saved = result.data?.createRecipe as MealRecipe | undefined;
    if (saved && onSaved) {
      onSaved(saved);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit recipe" : "New recipe"}
      description="Save a household recipe you can drag onto the weekly plan."
      className="w-[min(100%-2rem,42rem)]"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            required
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Servings</span>
          <input
            type="number"
            min={1}
            value={form.servings}
            onChange={(event) => setForm((current) => ({ ...current, servings: event.target.value }))}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Instructions</span>
          <textarea
            rows={4}
            value={form.instructions}
            onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-text-main">Ingredients</legend>
          {form.ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-[1fr_5rem_5rem_auto] gap-2">
              <input
                value={ingredient.name}
                placeholder="Ingredient"
                onChange={(event) => updateIngredient(index, "name", event.target.value)}
                className="min-h-10 rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                value={ingredient.quantity}
                placeholder="Qty"
                onChange={(event) => updateIngredient(index, "quantity", event.target.value)}
                className="min-h-10 rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                value={ingredient.unit}
                placeholder="Unit"
                onChange={(event) => updateIngredient(index, "unit", event.target.value)}
                className="min-h-10 rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
                  }))
                }
                disabled={form.ingredients.length === 1}
                className={cn(
                  "rounded p-1 text-text-muted hover:bg-background hover:text-error",
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted",
                )}
                aria-label={`Remove ingredient ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={() =>
              setForm((current) => ({
                ...current,
                ingredients: [...current.ingredients, { ...emptyIngredient }],
              }))
            }
          >
            Add ingredient
          </Button>
        </fieldset>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !form.name.trim()}>
            {loading ? "Saving…" : isEdit ? "Save recipe" : "Create recipe"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
