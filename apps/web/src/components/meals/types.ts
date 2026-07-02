import type { MealPlanQuery } from "@/graphql";

export type MealRecipe = MealPlanQuery["mealPlan"]["recipes"][number];
export type MealRecipeFolder = MealPlanQuery["mealPlan"]["folders"][number];
export type MealPlanSlot = MealPlanQuery["mealPlan"]["slots"][number];
export type GroceryItem = MealPlanQuery["mealPlan"]["groceryItems"][number];

export type RecipeIngredientInput = {
  name: string;
  quantity: string;
  unit: string;
};

export type RecipeFormValues = {
  name: string;
  instructions: string;
  servings: string;
  ingredients: RecipeIngredientInput[];
};
