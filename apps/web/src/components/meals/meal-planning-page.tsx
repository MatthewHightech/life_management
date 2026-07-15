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
import { useCallback, useMemo, useRef, useState } from "react";
import type { MealPlanQuery } from "@/graphql";
import {
  ASSIGN_MEAL_PLAN_SLOT_MUTATION,
  CLEAR_MEAL_PLAN_SLOT_MUTATION,
  MEAL_PLAN_QUERY,
  MOVE_RECIPE_TO_FOLDER_MUTATION,
} from "@/graphql";
import { FolderFormModal } from "@/components/folders/folder-form-modal";
import { GroceryListSection } from "@/components/meals/grocery-list-section";
import { ImportRecipeUrlModal } from "@/components/meals/import-recipe-url-modal";
import { RecipeFormModal } from "@/components/meals/recipe-form-modal";
import { RecipeLibrarySection } from "@/components/meals/recipe-library-section";
import { RecipeRow } from "@/components/meals/recipe-row";
import type { MealRecipe, RecipeFormValues } from "@/components/meals/types";
import { WeekGridSection } from "@/components/meals/week-grid-section";
import { ModulePageLayout } from "@/components/shell/module-page-layout";
import { createLibraryCollisionDetection } from "@/lib/folder-dnd";
import {
  buildFolderPath,
  filterFoldersForParent,
  filterItemsForFolder,
  folderIdAfterDelete,
} from "@/lib/folder-utils";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { parseFolderDropId, parseMealPlanSlotKey } from "@life/shared";
import type { MealSlot, WeekDay } from "@/graphql";

const MEAL_SCHEDULE_ZONE = "schedule";

type MealPlanData = MealPlanQuery["mealPlan"];

export function MealPlanningPage() {
  const recipeZoneRef = useRef<HTMLElement>(null);
  const scheduleZoneRef = useRef<HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<MealRecipe | null>(null);
  const [importDraft, setImportDraft] = useState<RecipeFormValues | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<MealRecipe | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const { data, loading, error } = useQuery<MealPlanQuery>(MEAL_PLAN_QUERY);
  const [assignSlot] = useMutation(ASSIGN_MEAL_PLAN_SLOT_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
  });
  const [clearSlot] = useMutation(CLEAR_MEAL_PLAN_SLOT_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
  });
  const [moveRecipeToFolder] = useMutation(MOVE_RECIPE_TO_FOLDER_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
    awaitRefetchQueries: true,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const collisionDetection = useMemo(
    () =>
      createLibraryCollisionDetection(
        "MEALS",
        () => recipeZoneRef.current?.getBoundingClientRect() ?? null,
        () => scheduleZoneRef.current?.getBoundingClientRect() ?? null,
        MEAL_SCHEDULE_ZONE,
      ),
    [],
  );

  const mealPlan: MealPlanData | undefined = data?.mealPlan;

  const recipeById = useMemo(
    () => new Map(mealPlan?.recipes.map((recipe) => [recipe.id, recipe]) ?? []),
    [mealPlan?.recipes],
  );

  const breadcrumbPath = useMemo(
    () => buildFolderPath(mealPlan?.folders ?? [], currentFolderId),
    [mealPlan?.folders, currentFolderId],
  );

  const visibleFolders = useMemo(
    () => filterFoldersForParent(mealPlan?.folders ?? [], currentFolderId),
    [mealPlan?.folders, currentFolderId],
  );

  const visibleRecipes = useMemo(
    () => filterItemsForFolder(mealPlan?.recipes ?? [], currentFolderId) as MealRecipe[],
    [mealPlan?.recipes, currentFolderId],
  );

  const handleNavigateFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
  }, []);

  const handleFolderDeleted = useCallback(
    (deletedFolderId: string) => {
      setCurrentFolderId((currentId) =>
        folderIdAfterDelete(mealPlan?.folders ?? [], currentId, deletedFolderId),
      );
    },
    [mealPlan?.folders],
  );

  const handleClear = useCallback(
    (day: WeekDay, slot: MealSlot) => {
      void clearSlot({ variables: { day, slot } });
    },
    [clearSlot],
  );

  function openCreate() {
    setEditingRecipe(null);
    setImportDraft(null);
    setModalOpen(true);
  }

  function openFromImport(values: RecipeFormValues) {
    setEditingRecipe(null);
    setImportDraft(values);
    setModalOpen(true);
  }

  function openEdit(recipe: MealRecipe) {
    setEditingRecipe(recipe);
    setImportDraft(null);
    setModalOpen(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveRecipe(null);

    if (!over) {
      return;
    }

    const recipeId = String(active.id);
    if (!recipeById.has(recipeId)) {
      return;
    }

    const folderTarget = parseFolderDropId(String(over.id));
    if (folderTarget?.namespace === "MEALS") {
      const recipe = recipeById.get(recipeId);
      if ((recipe?.folderId ?? null) === folderTarget.folderId) {
        return;
      }

      void moveRecipeToFolder({
        variables: {
          recipeId,
          folderId: folderTarget.folderId,
        },
      });
      return;
    }

    const slotKey = parseMealPlanSlotKey(String(over.id));
    if (!slotKey) {
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
          collisionDetection={collisionDetection}
          onDragStart={(event) => {
            const recipe = recipeById.get(String(event.active.id));
            setActiveRecipe(recipe ?? null);
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveRecipe(null)}
        >
          <div className="space-y-5">
            <RecipeLibrarySection
              ref={recipeZoneRef}
              folders={visibleFolders}
              recipes={visibleRecipes}
              breadcrumbPath={breadcrumbPath}
              onNavigateFolder={handleNavigateFolder}
              onCreate={openCreate}
              onImport={() => setImportOpen(true)}
              onCreateFolder={() => setFolderModalOpen(true)}
              onEdit={openEdit}
              onFolderDeleted={handleFolderDeleted}
            />
            <WeekGridSection ref={scheduleZoneRef} slots={mealPlan.slots} onClear={handleClear} />
            <GroceryListSection items={mealPlan.groceryItems} />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeRecipe ? <RecipeRow recipe={activeRecipe} onEdit={() => undefined} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <ImportRecipeUrlModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={openFromImport}
      />
      <RecipeFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setImportDraft(null);
          }
        }}
        recipe={editingRecipe}
        folderId={currentFolderId}
        initialValues={importDraft}
      />
      <FolderFormModal
        open={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        namespace="MEALS"
        parentId={currentFolderId}
        refetchQueries={[...MEAL_PLAN_REFETCH]}
      />
    </ModulePageLayout>
  );
}
