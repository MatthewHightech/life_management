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
  AssignMealPlanSlotDocument,
  ClearMealPlanSlotDocument,
  MealPlanDocument,
  MoveRecipeToFolderDocument,
} from "@/graphql";
import { FolderFormModal } from "@/components/folders/folder-form-modal";
import { ImportRecipeUrlModal } from "@/components/meals/import-recipe-url-modal";
import { MealsViewToggle } from "@/components/meals/meals-view-toggle";
import { RecipeFormModal } from "@/components/meals/recipe-form-modal";
import type { RecipeLibrarySectionProps } from "@/components/meals/recipe-library-section";
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
import { MEAL_PLAN_REFETCH } from "@/lib/refetch-queries";

const MEAL_SCHEDULE_ZONE = "schedule";
const MEALS_CONTENT_INSET = "mx-auto w-full max-w-[1400px] px-3 sm:px-4";

type MealsPageContextValue = {
  mealPlan: MealPlanQuery["mealPlan"] | null;
  recipeZoneRef: React.RefObject<HTMLElement | null>;
  library: RecipeLibrarySectionProps;
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

  const { data, loading, error } = useQuery<MealPlanQuery>(MealPlanDocument);
  const [assignSlot] = useMutation(AssignMealPlanSlotDocument, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
  });
  const [clearSlot] = useMutation(ClearMealPlanSlotDocument, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
  });
  const [moveRecipeToFolder] = useMutation(MoveRecipeToFolderDocument, {
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

  const handleFolderDeleted = useCallback(
    (deletedFolderId: string) => {
      setCurrentFolderId((currentId) =>
        folderIdAfterDelete(mealPlan?.folders ?? [], currentId, deletedFolderId),
      );
    },
    [mealPlan?.folders],
  );

  const handleClearDay = useCallback(
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

  const openForm = useCallback((recipe: MealRecipe | null, draft: RecipeFormValues | null) => {
    setViewOpen(false);
    setViewingRecipe(recipe);
    setEditingRecipe(recipe);
    setImportDraft(draft);
    setModalOpen(true);
  }, []);

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
      mealPlan,
      recipeZoneRef,
      library: {
        folders: visibleFolders,
        recipes: visibleRecipes,
        breadcrumbPath,
        onNavigateFolder: setCurrentFolderId,
        onCreate: () => openForm(null, null),
        onImport: () => setImportOpen(true),
        onCreateFolder: () => setFolderModalOpen(true),
        onOpenRecipe: (recipe) => {
          setViewingRecipe(recipe);
          setViewOpen(true);
        },
        onFolderDeleted: handleFolderDeleted,
      },
    }),
    [mealPlan, visibleFolders, visibleRecipes, breadcrumbPath, openForm, handleFolderDeleted],
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
                <WeekGridSection
                  ref={scheduleZoneRef}
                  slots={mealPlan.slots}
                  onClear={handleClearDay}
                  onOpenRecipe={(recipe) => {
                    setViewingRecipe(recipe);
                    setViewOpen(true);
                  }}
                />
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
          onImported={(values) => openForm(null, values)}
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
          onEdit={(recipe) => openForm(recipe, null)}
          onRecipeUpdated={setViewingRecipe}
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
