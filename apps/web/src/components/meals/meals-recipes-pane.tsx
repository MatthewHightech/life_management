"use client";

import { GroceryListSection } from "@/components/meals/grocery-list-section";
import { useMealsPage } from "@/components/meals/meals-page-layout";
import { RecipeLibrarySection } from "@/components/meals/recipe-library-section";

export function MealsRecipesPane() {
  const {
    mealPlan,
    recipeZoneRef,
    visibleFolders,
    visibleRecipes,
    breadcrumbPath,
    onNavigateFolder,
    openCreate,
    openImport,
    openCreateFolder,
    openView,
    onFolderDeleted,
  } = useMealsPage();

  if (!mealPlan) {
    return null;
  }

  return (
    <RecipeLibrarySection
      ref={recipeZoneRef}
      folders={visibleFolders}
      recipes={visibleRecipes}
      breadcrumbPath={breadcrumbPath}
      onNavigateFolder={onNavigateFolder}
      onCreate={openCreate}
      onImport={openImport}
      onCreateFolder={openCreateFolder}
      onOpenRecipe={openView}
      onFolderDeleted={onFolderDeleted}
    />
  );
}

export function MealsGroceryPane() {
  const { mealPlan } = useMealsPage();

  if (!mealPlan) {
    return null;
  }

  return <GroceryListSection items={mealPlan.groceryItems} />;
}
