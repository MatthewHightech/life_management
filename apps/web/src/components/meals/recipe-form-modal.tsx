"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { CREATE_RECIPE_MUTATION, UPDATE_RECIPE_MUTATION } from "@/graphql";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { MealRecipe, RecipeFormValues } from "@/components/meals/types";

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
};

export function RecipeFormModal({ open, onOpenChange, recipe }: RecipeFormModalProps) {
  const [form, setForm] = useState<RecipeFormValues>(() => toFormValues(recipe));
  const isEdit = Boolean(recipe);

  useEffect(() => {
    if (open) {
      setForm(toFormValues(recipe));
    }
  }, [open, recipe]);

  const [createRecipe, { loading: creating }] = useMutation(CREATE_RECIPE_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  const [updateRecipe, { loading: updating }] = useMutation(UPDATE_RECIPE_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
    onCompleted: () => onOpenChange(false),
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
      await updateRecipe({ variables: { id: recipe.id, input } });
      return;
    }

    await createRecipe({ variables: { input } });
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
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
                  }))
                }
                disabled={form.ingredients.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
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
