"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";
import type { MealPlanQuery } from "@/graphql";
import {
  ASSIGN_MEAL_PLAN_SLOT_MUTATION,
  CLEAR_MEAL_PLAN_SLOT_MUTATION,
  MEAL_PLAN_QUERY,
} from "@/graphql";
import { GroceryListSection } from "@/components/meals/grocery-list-section";
import { RecipeFormModal } from "@/components/meals/recipe-form-modal";
import { RecipeLibrarySection } from "@/components/meals/recipe-library-section";
import { RecipeRow } from "@/components/meals/recipe-row";
import type { MealRecipe } from "@/components/meals/types";
import { WeekGridSection } from "@/components/meals/week-grid-section";
import { ModulePageLayout } from "@/components/shell/module-page-layout";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { parseMealPlanSlotKey } from "@life/shared";
import type { MealSlot, WeekDay } from "@/graphql";

type MealPlanData = MealPlanQuery["mealPlan"];

export function MealPlanningPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<MealRecipe | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<MealRecipe | null>(null);

  const { data, loading, error } = useQuery<MealPlanQuery>(MEAL_PLAN_QUERY);
  const [assignSlot] = useMutation(ASSIGN_MEAL_PLAN_SLOT_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
  });
  const [clearSlot] = useMutation(CLEAR_MEAL_PLAN_SLOT_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const mealPlan: MealPlanData | undefined = data?.mealPlan;

  const recipeById = useMemo(
    () => new Map(mealPlan?.recipes.map((recipe) => [recipe.id, recipe]) ?? []),
    [mealPlan?.recipes],
  );

  const handleClear = useCallback(
    (day: WeekDay, slot: MealSlot) => {
      void clearSlot({ variables: { day, slot } });
    },
    [clearSlot],
  );

  function openCreate() {
    setEditingRecipe(null);
    setModalOpen(true);
  }

  function openEdit(recipe: MealRecipe) {
    setEditingRecipe(recipe);
    setModalOpen(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveRecipe(null);

    if (!over) {
      return;
    }

    const recipeId = String(active.id);
    const slotKey = parseMealPlanSlotKey(String(over.id));

    if (!slotKey || !recipeById.has(recipeId)) {
      return;
    }

    void assignSlot({
      variables: {
        day: slotKey.day,
        slot: slotKey.slot,
        recipeId,
      },
    });
  }

  return (
    <ModulePageLayout title="Meal Planning">
      {loading && <p className="text-sm text-text-muted">Loading meal plan…</p>}
      {error && <p className="text-sm text-error">Could not load meal plan: {error.message}</p>}

      {!loading && !error && mealPlan && (
        <DndContext
          sensors={sensors}
          onDragStart={(event) => {
            const recipe = recipeById.get(String(event.active.id));
            setActiveRecipe(recipe ?? null);
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveRecipe(null)}
        >
          <div className="space-y-5">
            <RecipeLibrarySection recipes={mealPlan.recipes} onCreate={openCreate} onEdit={openEdit} />
            <WeekGridSection slots={mealPlan.slots} onClear={handleClear} />
            <GroceryListSection items={mealPlan.groceryItems} />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeRecipe ? <RecipeRow recipe={activeRecipe} onEdit={() => undefined} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <RecipeFormModal open={modalOpen} onOpenChange={setModalOpen} recipe={editingRecipe} />
    </ModulePageLayout>
  );
}
