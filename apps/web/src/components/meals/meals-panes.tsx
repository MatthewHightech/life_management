"use client";

import { GroceryListSection } from "@/components/meals/grocery-list-section";
import { useMealsPage } from "@/components/meals/meals-page-layout";
import { RecipeLibrarySection } from "@/components/meals/recipe-library-section";

export function MealsRecipesPane() {
  const { mealPlan, recipeZoneRef, library } = useMealsPage();

  if (!mealPlan) {
    return null;
  }

  return <RecipeLibrarySection ref={recipeZoneRef} {...library} />;
}

export function MealsGroceryPane() {
  const { mealPlan } = useMealsPage();

  if (!mealPlan) {
    return null;
  }

  return <GroceryListSection items={mealPlan.groceryItems} />;
}
