import { MealSlot, Prisma, WeekDay } from "@prisma/client";
import {
  getMealPlanWeekStartIso,
  mergeGroceryIngredients,
  parseMealPlanWeekStart,
} from "@life/shared";
import { GraphQLContext } from "../context";
import { ForbiddenError, requireHouseholdUser } from "../auth";
import { cleanupMealPlanWeeksBefore } from "./rollover";

const recipeInclude = {
  ingredients: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.RecipeInclude;

const slotInclude = {
  recipe: { include: recipeInclude },
} satisfies Prisma.MealPlanSlotInclude;

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

async function assertRecipeInHousehold(context: GraphQLContext, recipeId: string, householdId: string) {
  const recipe = await context.prisma.recipe.findFirst({
    where: { id: recipeId, householdId },
    select: { id: true },
  });

  if (!recipe) {
    throw new ForbiddenError("Recipe not found in household");
  }
}

async function getCurrentWeekStart(context: GraphQLContext, householdId: string) {
  const weekStartIso = getMealPlanWeekStartIso();
  return parseMealPlanWeekStart(weekStartIso);
}

async function regenerateAutoGrocery(
  context: GraphQLContext,
  householdId: string,
  weekStart: Date,
) {
  const slots = await context.prisma.mealPlanSlot.findMany({
    where: { householdId, weekStart, recipeId: { not: null } },
    include: {
      recipe: {
        include: recipeInclude,
      },
    },
  });

  const ingredients = slots.flatMap((entry) => entry.recipe?.ingredients ?? []);
  const merged = mergeGroceryIngredients(
    ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    })),
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

async function loadMealPlan(context: GraphQLContext, householdId: string) {
  const weekStart = await getCurrentWeekStart(context, householdId);
  const weekStartIso = toIsoDate(weekStart);

  const [recipes, slots, groceryItems] = await Promise.all([
    context.prisma.recipe.findMany({
      where: { householdId },
      include: recipeInclude,
      orderBy: { name: "asc" },
    }),
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

  return {
    weekStart: weekStartIso,
    recipes,
    slots,
    groceryItems,
  };
}

export const mealResolvers = {
  Query: {
    mealPlan: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return loadMealPlan(context, householdId);
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
          ingredients: { name: string; quantity?: string | null; unit?: string | null }[];
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const { input } = args;

      return context.prisma.recipe.create({
        data: {
          householdId,
          name: input.name.trim(),
          instructions: input.instructions?.trim() || null,
          servings: input.servings ?? null,
          ingredients: {
            create: input.ingredients.map((ingredient, index) => ({
              name: ingredient.name.trim(),
              quantity: ingredient.quantity?.trim() || null,
              unit: ingredient.unit?.trim() || null,
              sortOrder: index,
            })),
          },
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
          ingredients?: { name: string; quantity?: string | null; unit?: string | null }[] | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertRecipeInHousehold(context, args.id, householdId);

      const data: Prisma.RecipeUpdateInput = {};

      if (args.input.name !== undefined && args.input.name !== null) {
        data.name = args.input.name.trim();
      }

      if (args.input.instructions !== undefined) {
        data.instructions = args.input.instructions?.trim() || null;
      }

      if (args.input.servings !== undefined) {
        data.servings = args.input.servings;
      }

      if (args.input.ingredients) {
        await context.prisma.recipeIngredient.deleteMany({ where: { recipeId: args.id } });
        data.ingredients = {
          create: args.input.ingredients.map((ingredient, index) => ({
            name: ingredient.name.trim(),
            quantity: ingredient.quantity?.trim() || null,
            unit: ingredient.unit?.trim() || null,
            sortOrder: index,
          })),
        };
      }

      const weekStart = await getCurrentWeekStart(context, householdId);
      const recipe = await context.prisma.recipe.update({
        where: { id: args.id },
        data,
        include: recipeInclude,
      });

      await regenerateAutoGrocery(context, householdId, weekStart);
      return recipe;
    },

    deleteRecipe: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertRecipeInHousehold(context, args.id, householdId);

      const weekStart = await getCurrentWeekStart(context, householdId);

      await context.prisma.mealPlanSlot.deleteMany({
        where: { householdId, weekStart, recipeId: args.id },
      });

      await context.prisma.recipe.delete({ where: { id: args.id } });
      await regenerateAutoGrocery(context, householdId, weekStart);
      return true;
    },

    assignMealPlanSlot: async (
      _parent: unknown,
      args: { day: WeekDay; slot: MealSlot; recipeId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertRecipeInHousehold(context, args.recipeId, householdId);

      const weekStart = await getCurrentWeekStart(context, householdId);

      const slot = await context.prisma.mealPlanSlot.upsert({
        where: {
          householdId_weekStart_day_slot: {
            householdId,
            weekStart,
            day: args.day,
            slot: args.slot,
          },
        },
        create: {
          householdId,
          weekStart,
          day: args.day,
          slot: args.slot,
          recipeId: args.recipeId,
        },
        update: {
          recipeId: args.recipeId,
        },
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
      const weekStart = await getCurrentWeekStart(context, householdId);

      await context.prisma.mealPlanSlot.deleteMany({
        where: {
          householdId,
          weekStart,
          day: args.day,
          slot: args.slot,
        },
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
      const weekStart = await getCurrentWeekStart(context, householdId);

      return context.prisma.groceryListItem.create({
        data: {
          householdId,
          weekStart,
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
      const existing = await context.prisma.groceryListItem.findFirst({
        where: { id: args.id, householdId },
      });

      if (!existing) {
        throw new ForbiddenError("Grocery item not found in household");
      }

      return context.prisma.groceryListItem.update({
        where: { id: args.id },
        data: {
          ...(args.input.name !== undefined && args.input.name !== null
            ? { name: args.input.name.trim() }
            : {}),
          ...(args.input.quantityLabel !== undefined
            ? { quantityLabel: args.input.quantityLabel?.trim() || "" }
            : {}),
          ...(args.input.isBought !== undefined && args.input.isBought !== null
            ? { isBought: args.input.isBought }
            : {}),
        },
      });
    },

    deleteGroceryItem: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const existing = await context.prisma.groceryListItem.findFirst({
        where: { id: args.id, householdId },
      });

      if (!existing) {
        throw new ForbiddenError("Grocery item not found in household");
      }

      await context.prisma.groceryListItem.delete({ where: { id: args.id } });
      return true;
    },

    removeBoughtGroceryItems: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const weekStart = await getCurrentWeekStart(context, householdId);

      const result = await context.prisma.groceryListItem.deleteMany({
        where: { householdId, weekStart, isBought: true },
      });

      return result.count;
    },
  },

  Recipe: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
  },
};
