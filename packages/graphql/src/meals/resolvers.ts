import { FolderNamespace, MealSlot, Prisma, WeekDay } from "@prisma/client";
import {
  DEFAULT_RECIPE_MULTIPLIER,
  getMealPlanWeekStartIso,
  mergeGroceryIngredients,
  normalizeRecipeMultiplier,
  parseMealPlanWeekStart,
  scaleGroceryIngredients,
} from "@life/shared";
import { importRecipeFromUrl, RecipeImportError } from "@life/recipe-import";
import { GraphQLContext } from "../context";
import { found, requireHouseholdUser } from "../auth";
import { optionalText, optionalTextUpdate, timestampFields, toIsoDate } from "../fields";
import { assertFolderInHousehold, loadFoldersForNamespace } from "../folders/helpers";

const recipeInclude = {
  ingredients: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.RecipeInclude;

const slotInclude = {
  recipe: { include: recipeInclude },
} satisfies Prisma.MealPlanSlotInclude;

type IngredientInput = { name: string; quantity?: string | null; unit?: string | null };

function ingredientRows(ingredients: IngredientInput[]) {
  return ingredients.map((ingredient, index) => ({
    name: ingredient.name.trim(),
    quantity: optionalText(ingredient.quantity),
    unit: optionalText(ingredient.unit),
    sortOrder: index,
  }));
}

function currentWeekStart() {
  return parseMealPlanWeekStart(getMealPlanWeekStartIso());
}

async function assertRecipeInHousehold(context: GraphQLContext, recipeId: string, householdId: string) {
  found(
    await context.prisma.recipe.findFirst({ where: { id: recipeId, householdId }, select: { id: true } }),
    "Recipe not found in household",
  );
}

async function assertGroceryItemInHousehold(context: GraphQLContext, id: string, householdId: string) {
  found(
    await context.prisma.groceryListItem.findFirst({ where: { id, householdId }, select: { id: true } }),
    "Grocery item not found in household",
  );
}

async function regenerateAutoGrocery(
  context: GraphQLContext,
  householdId: string,
  weekStart: Date,
) {
  const slots = await context.prisma.mealPlanSlot.findMany({
    where: { householdId, weekStart, recipeId: { not: null } },
    include: slotInclude,
  });

  const merged = mergeGroceryIngredients(
    slots.flatMap((entry) => {
      const recipe = entry.recipe;
      if (!recipe) {
        return [];
      }
      return scaleGroceryIngredients(
        recipe.ingredients,
        normalizeRecipeMultiplier(recipe.recipeMultiplier),
      );
    }),
  );

  await context.prisma.groceryListItem.deleteMany({
    where: { householdId, weekStart, isManual: false },
  });

  if (merged.length > 0) {
    await context.prisma.groceryListItem.createMany({
      data: merged.map((item, index) => ({
        householdId,
        weekStart,
        name: item.name,
        quantityLabel: item.quantityLabel,
        isManual: false,
        sortOrder: index,
      })),
    });
  }
}

export const mealResolvers = {
  Query: {
    mealPlan: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const weekStart = currentWeekStart();

      const [recipes, folders, slots, groceryItems] = await Promise.all([
        context.prisma.recipe.findMany({
          where: { householdId },
          include: recipeInclude,
          orderBy: { name: "asc" },
        }),
        loadFoldersForNamespace(context, householdId, FolderNamespace.MEALS),
        context.prisma.mealPlanSlot.findMany({
          where: { householdId, weekStart },
          include: slotInclude,
          orderBy: [{ day: "asc" }, { slot: "asc" }],
        }),
        context.prisma.groceryListItem.findMany({
          where: { householdId, weekStart },
          orderBy: [{ isManual: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
        }),
      ]);

      return { weekStart: toIsoDate(weekStart), recipes, folders, slots, groceryItems };
    },

    importRecipeFromUrl: async (
      _parent: unknown,
      args: { url: string },
      context: GraphQLContext,
    ) => {
      await requireHouseholdUser(context);
      try {
        return await importRecipeFromUrl(args.url);
      } catch (error) {
        if (error instanceof RecipeImportError) {
          throw new Error(error.message);
        }
        throw error;
      }
    },
  },

  Mutation: {
    createRecipe: async (
      _parent: unknown,
      args: {
        input: {
          name: string;
          instructions?: string | null;
          servings?: number | null;
          recipeMultiplier?: number | null;
          folderId?: string | null;
          ingredients: IngredientInput[];
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const { input } = args;
      await assertFolderInHousehold(context, input.folderId, householdId, FolderNamespace.MEALS);

      return context.prisma.recipe.create({
        data: {
          householdId,
          folderId: input.folderId ?? null,
          name: input.name.trim(),
          instructions: optionalText(input.instructions),
          servings: input.servings ?? null,
          recipeMultiplier:
            input.recipeMultiplier == null
              ? DEFAULT_RECIPE_MULTIPLIER
              : normalizeRecipeMultiplier(input.recipeMultiplier),
          ingredients: { create: ingredientRows(input.ingredients) },
        },
        include: recipeInclude,
      });
    },

    updateRecipe: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          name?: string | null;
          instructions?: string | null;
          servings?: number | null;
          recipeMultiplier?: number | null;
          ingredients?: IngredientInput[] | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertRecipeInHousehold(context, args.id, householdId);
      const { input } = args;

      if (input.ingredients) {
        await context.prisma.recipeIngredient.deleteMany({ where: { recipeId: args.id } });
      }

      const recipe = await context.prisma.recipe.update({
        where: { id: args.id },
        data: {
          name: input.name?.trim() ?? undefined,
          instructions: optionalTextUpdate(input.instructions),
          servings: input.servings,
          recipeMultiplier:
            input.recipeMultiplier === undefined || input.recipeMultiplier === null
              ? undefined
              : normalizeRecipeMultiplier(input.recipeMultiplier),
          ingredients: input.ingredients ? { create: ingredientRows(input.ingredients) } : undefined,
        },
        include: recipeInclude,
      });

      await regenerateAutoGrocery(context, householdId, currentWeekStart());
      return recipe;
    },

    deleteRecipe: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertRecipeInHousehold(context, args.id, householdId);
      const weekStart = currentWeekStart();

      await context.prisma.mealPlanSlot.deleteMany({
        where: { householdId, weekStart, recipeId: args.id },
      });
      await context.prisma.recipe.delete({ where: { id: args.id } });
      await regenerateAutoGrocery(context, householdId, weekStart);
      return true;
    },

    moveRecipeToFolder: async (
      _parent: unknown,
      args: { recipeId: string; folderId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertRecipeInHousehold(context, args.recipeId, householdId);
      await assertFolderInHousehold(context, args.folderId, householdId, FolderNamespace.MEALS);

      return context.prisma.recipe.update({
        where: { id: args.recipeId },
        data: { folderId: args.folderId ?? null },
        include: recipeInclude,
      });
    },

    assignMealPlanSlot: async (
      _parent: unknown,
      args: { day: WeekDay; slot: MealSlot; recipeId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertRecipeInHousehold(context, args.recipeId, householdId);
      const weekStart = currentWeekStart();

      const slot = await context.prisma.mealPlanSlot.upsert({
        where: {
          householdId_weekStart_day_slot: { householdId, weekStart, day: args.day, slot: args.slot },
        },
        create: { householdId, weekStart, day: args.day, slot: args.slot, recipeId: args.recipeId },
        update: { recipeId: args.recipeId },
        include: slotInclude,
      });

      await regenerateAutoGrocery(context, householdId, weekStart);
      return slot;
    },

    clearMealPlanSlot: async (
      _parent: unknown,
      args: { day: WeekDay; slot: MealSlot },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const weekStart = currentWeekStart();

      await context.prisma.mealPlanSlot.deleteMany({
        where: { householdId, weekStart, day: args.day, slot: args.slot },
      });

      await regenerateAutoGrocery(context, householdId, weekStart);
      return true;
    },

    addGroceryItem: async (
      _parent: unknown,
      args: { input: { name: string; quantityLabel?: string | null } },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);

      return context.prisma.groceryListItem.create({
        data: {
          householdId,
          weekStart: currentWeekStart(),
          name: args.input.name.trim(),
          quantityLabel: args.input.quantityLabel?.trim() || "",
          isManual: true,
        },
      });
    },

    updateGroceryItem: async (
      _parent: unknown,
      args: {
        id: string;
        input: { name?: string | null; quantityLabel?: string | null; isBought?: boolean | null };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertGroceryItemInHousehold(context, args.id, householdId);
      const { input } = args;

      return context.prisma.groceryListItem.update({
        where: { id: args.id },
        data: {
          name: input.name?.trim() ?? undefined,
          quantityLabel:
            input.quantityLabel === undefined ? undefined : input.quantityLabel?.trim() || "",
          isBought: input.isBought ?? undefined,
        },
      });
    },

    deleteGroceryItem: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertGroceryItemInHousehold(context, args.id, householdId);

      await context.prisma.groceryListItem.delete({ where: { id: args.id } });
      return true;
    },

    removeBoughtGroceryItems: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);

      const result = await context.prisma.groceryListItem.deleteMany({
        where: { householdId, weekStart: currentWeekStart(), isBought: true },
      });

      return result.count;
    },
  },

  Recipe: timestampFields,
};
