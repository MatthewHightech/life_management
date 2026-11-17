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
import { MEAL_SLOTS, parseFolderDropId, parseMealPlanSlotKey } from "@life/shared";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { MealPlanQuery, WeekDay } from "@/graphql";
import {
  ASSIGN_MEAL_PLAN_SLOT_MUTATION,
  CLEAR_MEAL_PLAN_SLOT_MUTATION,
  MEAL_PLAN_QUERY,
  MOVE_RECIPE_TO_FOLDER_MUTATION,
} from "@/graphql";
import { FolderFormModal } from "@/components/folders/folder-form-modal";
import { ImportRecipeUrlModal } from "@/components/meals/import-recipe-url-modal";
import { MealsViewToggle } from "@/components/meals/meals-view-toggle";
import { RecipeFormModal } from "@/components/meals/recipe-form-modal";
import { RecipeRow } from "@/components/meals/recipe-row";
import { RecipeViewModal } from "@/components/meals/recipe-view-modal";
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
import { DAY_MEAL_SLOT } from "@/lib/meal-plan-ui";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";

const MEAL_SCHEDULE_ZONE = "schedule";
const MEALS_CONTENT_INSET = "mx-auto w-full max-w-[1400px] px-3 sm:px-4";

type MealPlanData = MealPlanQuery["mealPlan"];

type MealsPageContextValue = {
  loading: boolean;
  errorMessage: string | null;
  mealPlan: MealPlanData | null;
  recipeZoneRef: React.RefObject<HTMLElement | null>;
  currentFolderId: string | null;
  breadcrumbPath: NonNullable<MealPlanData>["folders"];
  visibleFolders: NonNullable<MealPlanData>["folders"];
  visibleRecipes: MealRecipe[];
  onNavigateFolder: (folderId: string | null) => void;
  onFolderDeleted: (folderId: string) => void;
  openCreate: () => void;
  openImport: () => void;
  openCreateFolder: () => void;
  openView: (recipe: MealRecipe) => void;
};

const MealsPageContext = createContext<MealsPageContextValue | null>(null);

export function useMealsPage() {
  const value = useContext(MealsPageContext);
  if (!value) {
    throw new Error("useMealsPage must be used within MealsPageLayout");
  }
  return value;
}

type MealsPageLayoutProps = {
  children: React.ReactNode;
};

export function MealsPageLayout({ children }: MealsPageLayoutProps) {
  const recipeZoneRef = useRef<HTMLElement>(null);
  const scheduleZoneRef = useRef<HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<MealRecipe | null>(null);
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

  const mealPlan = data?.mealPlan ?? null;

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

  const clearDaySlots = useCallback(
    async (day: WeekDay) => {
      for (const slot of MEAL_SLOTS) {
        await clearSlot({
          variables: { day, slot },
          refetchQueries: slot === DAY_MEAL_SLOT ? [...MEAL_PLAN_REFETCH] : [],
        });
      }
    },
    [clearSlot],
  );

  const handleClearDay = useCallback(
    (day: WeekDay) => {
      void clearDaySlots(day);
    },
    [clearDaySlots],
  );

  const openCreate = useCallback(() => {
    setViewOpen(false);
    setViewingRecipe(null);
    setEditingRecipe(null);
    setImportDraft(null);
    setModalOpen(true);
  }, []);

  const openImport = useCallback(() => {
    setImportOpen(true);
  }, []);

  const openCreateFolder = useCallback(() => {
    setFolderModalOpen(true);
  }, []);

  const openView = useCallback((recipe: MealRecipe) => {
    setViewingRecipe(recipe);
    setViewOpen(true);
  }, []);

  function openFromImport(values: RecipeFormValues) {
    setViewOpen(false);
    setViewingRecipe(null);
    setEditingRecipe(null);
    setImportDraft(values);
    setModalOpen(true);
  }

  function openEdit(recipe: MealRecipe) {
    setViewOpen(false);
    setViewingRecipe(recipe);
    setEditingRecipe(recipe);
    setImportDraft(null);
    setModalOpen(true);
  }

  function handleRecipeSaved(recipe: MealRecipe) {
    setModalOpen(false);
    setImportDraft(null);
    setEditingRecipe(null);
    setViewingRecipe(recipe);
    setViewOpen(true);
  }

  async function assignDayRecipe(day: WeekDay, recipeId: string) {
    for (const slot of MEAL_SLOTS) {
      if (slot === DAY_MEAL_SLOT) {
        continue;
      }
      await clearSlot({
        variables: { day, slot },
        refetchQueries: [],
      });
    }

    await assignSlot({
      variables: {
        day,
        slot: DAY_MEAL_SLOT,
        recipeId,
      },
    });
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

    void assignDayRecipe(slotKey.day, recipeId);
  }

  const contextValue = useMemo<MealsPageContextValue>(
    () => ({
      loading,
      errorMessage: error?.message ?? null,
      mealPlan,
      recipeZoneRef,
      currentFolderId,
      breadcrumbPath,
      visibleFolders,
      visibleRecipes,
      onNavigateFolder: handleNavigateFolder,
      onFolderDeleted: handleFolderDeleted,
      openCreate,
      openImport,
      openCreateFolder,
      openView,
    }),
    [
      loading,
      error?.message,
      mealPlan,
      currentFolderId,
      breadcrumbPath,
      visibleFolders,
      visibleRecipes,
      handleNavigateFolder,
      handleFolderDeleted,
      openCreate,
      openImport,
      openCreateFolder,
      openView,
    ],
  );

  return (
    <MealsPageContext.Provider value={contextValue}>
      <ModulePageLayout
        title="Meal Planning"
        headerExtra={<MealsViewToggle />}
        contentInsetClassName={MEALS_CONTENT_INSET}
      >
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
            <div className="flex h-[calc(100dvh-8.5rem)] min-h-[28rem] gap-4">
              <div className="min-h-0 min-w-0 flex-[2]">{children}</div>
              <div className="min-h-0 min-w-0 flex-1">
                <WeekGridSection ref={scheduleZoneRef} slots={mealPlan.slots} onClear={handleClearDay} />
              </div>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeRecipe ? <RecipeRow recipe={activeRecipe} onOpen={() => undefined} overlay /> : null}
            </DragOverlay>
          </DndContext>
        )}

        <ImportRecipeUrlModal
          open={importOpen}
          onOpenChange={setImportOpen}
          onImported={openFromImport}
        />
        <RecipeViewModal
          recipe={viewingRecipe}
          open={viewOpen}
          onOpenChange={(open) => {
            setViewOpen(open);
            if (!open) {
              setViewingRecipe(null);
            }
          }}
          onEdit={openEdit}
        />
        <RecipeFormModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              setImportDraft(null);
              if (editingRecipe && viewingRecipe) {
                setEditingRecipe(null);
                setViewOpen(true);
                return;
              }
              setEditingRecipe(null);
            }
          }}
          recipe={editingRecipe}
          folderId={currentFolderId}
          initialValues={importDraft}
          onSaved={handleRecipeSaved}
        />
        <FolderFormModal
          open={folderModalOpen}
          onOpenChange={setFolderModalOpen}
          namespace="MEALS"
          parentId={currentFolderId}
          refetchQueries={[...MEAL_PLAN_REFETCH]}
        />
      </ModulePageLayout>
    </MealsPageContext.Provider>
  );
}
