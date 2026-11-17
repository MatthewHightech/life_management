"use client";

import {
  DEFAULT_RECIPE_MULTIPLIER,
  RECIPE_MULTIPLIERS,
  formatRecipeMultiplierLabel,
  isRecipeMultiplier,
  scaleServings,
  type RecipeMultiplier,
} from "@life/shared";
import { SegmentedControl } from "@/components/ui/segmented-control";

const MULTIPLIER_ITEMS = RECIPE_MULTIPLIERS.map((value) => ({
  value: String(value),
  label: formatRecipeMultiplierLabel(value),
}));

type RecipeMultiplierControlProps = {
  value: number;
  onChange: (value: RecipeMultiplier) => void;
  disabled?: boolean;
  size?: "sm" | "lg";
};

export function toRecipeMultiplier(value: number | null | undefined): RecipeMultiplier {
  if (value != null && isRecipeMultiplier(value)) {
    return value;
  }
  return DEFAULT_RECIPE_MULTIPLIER;
}

export function recipeServingsLabel(recipe: {
  servings?: number | null;
  recipeMultiplier?: number | null;
}): string | null {
  const multiplier = toRecipeMultiplier(recipe.recipeMultiplier);
  const scaled = scaleServings(recipe.servings, multiplier);
  const multiplierLabel = formatRecipeMultiplierLabel(multiplier);

  if (scaled == null) {
    return multiplier === 1 ? null : multiplierLabel;
  }

  return `${scaled} servings · ${multiplierLabel}`;
}

export function RecipeMultiplierControl({
  value,
  onChange,
  disabled = false,
  size = "sm",
}: RecipeMultiplierControlProps) {
  const multiplier = toRecipeMultiplier(value);

  return (
    <SegmentedControl
      aria-label="Recipe multiplier"
      items={MULTIPLIER_ITEMS}
      value={String(multiplier)}
      disabled={disabled}
      size={size}
      onChange={(next) => onChange(Number(next) as RecipeMultiplier)}
    />
  );
}
