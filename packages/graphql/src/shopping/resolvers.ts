import { Prisma, ShoppingUrgency } from "@prisma/client";
import { toIsoString } from "@life/shared";
import { GraphQLContext } from "../context";
import { found, requireHouseholdUser } from "../auth";
import { requiredTextUpdate, requireText, timestampFields } from "../fields";

const shoppingItemInclude = {
  createdBy: true,
  _count: { select: { comments: true } },
} satisfies Prisma.ShoppingItemInclude;

const commentInclude = {
  author: true,
} satisfies Prisma.ShoppingItemCommentInclude;

async function assertShoppingItemInHousehold(context: GraphQLContext, id: string, householdId: string) {
  found(
    await context.prisma.shoppingItem.findFirst({ where: { id, householdId }, select: { id: true } }),
    "Shopping item not found",
  );
}

function validateBudgetCents(value: number | null | undefined) {
  if (value != null && (!Number.isInteger(value) || value < 0)) {
    throw new Error("Budget must be zero or greater");
  }
}

async function markCommentsRead(
  context: GraphQLContext,
  shoppingItemId: string,
  userId: string,
  readAt = new Date(),
) {
  await context.prisma.shoppingItemCommentRead.upsert({
    where: { userId_shoppingItemId: { userId, shoppingItemId } },
    create: { userId, shoppingItemId, readAt },
    update: { readAt },
  });
}

export const shoppingResolvers = {
  Query: {
    shoppingItems: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      return context.prisma.shoppingItem.findMany({
        where: { householdId },
        include: shoppingItemInclude,
        orderBy: [{ purchasedAt: "asc" }, { urgency: "desc" }, { createdAt: "desc" }],
      });
    },

    shoppingItemComments: async (
      _parent: unknown,
      args: { shoppingItemId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertShoppingItemInHousehold(context, args.shoppingItemId, householdId);
      return context.prisma.shoppingItemComment.findMany({
        where: { shoppingItemId: args.shoppingItemId },
        include: commentInclude,
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    createShoppingItem: async (
      _parent: unknown,
      args: {
        input: {
          name: string;
          budgetCents?: number | null;
          urgency?: ShoppingUrgency | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const name = requireText(args.input.name, "Item name is required");
      validateBudgetCents(args.input.budgetCents);

      return context.prisma.shoppingItem.create({
        data: {
          householdId,
          createdById: userId,
          name,
          budgetCents: args.input.budgetCents ?? null,
          urgency: args.input.urgency ?? ShoppingUrgency.MEDIUM,
        },
        include: shoppingItemInclude,
      });
    },

    updateShoppingItem: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          name?: string | null;
          budgetCents?: number | null;
          clearBudget?: boolean | null;
          urgency?: ShoppingUrgency | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertShoppingItemInHousehold(context, args.id, householdId);
      validateBudgetCents(args.input.budgetCents);

      return context.prisma.shoppingItem.update({
        where: { id: args.id },
        data: {
          name: requiredTextUpdate(args.input.name, "Item name is required"),
          ...(args.input.clearBudget
            ? { budgetCents: null }
            : args.input.budgetCents != null
              ? { budgetCents: args.input.budgetCents }
              : {}),
          urgency: args.input.urgency ?? undefined,
        },
        include: shoppingItemInclude,
      });
    },

    setShoppingItemPurchased: async (
      _parent: unknown,
      args: { id: string; purchased: boolean },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertShoppingItemInHousehold(context, args.id, householdId);
      return context.prisma.shoppingItem.update({
        where: { id: args.id },
        data: { purchasedAt: args.purchased ? new Date() : null },
        include: shoppingItemInclude,
      });
    },

    deleteShoppingItem: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertShoppingItemInHousehold(context, args.id, householdId);
      await context.prisma.shoppingItem.delete({ where: { id: args.id } });
      return true;
    },

    clearPurchasedShoppingItems: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const result = await context.prisma.shoppingItem.deleteMany({
        where: { householdId, purchasedAt: { not: null } },
      });
      return result.count;
    },

    addShoppingItemComment: async (
      _parent: unknown,
      args: { shoppingItemId: string; body: string },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      await assertShoppingItemInHousehold(context, args.shoppingItemId, householdId);
      const body = requireText(args.body, "Comment cannot be empty");

      const comment = await context.prisma.shoppingItemComment.create({
        data: {
          shoppingItemId: args.shoppingItemId,
          authorId: userId,
          body,
        },
        include: commentInclude,
      });
      await markCommentsRead(context, args.shoppingItemId, userId);
      return comment;
    },

    deleteShoppingItemComment: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const comment = found(
        await context.prisma.shoppingItemComment.findFirst({
          where: { id: args.id, shoppingItem: { householdId } },
        }),
        "Comment not found",
      );
      if (comment.authorId !== userId) {
        throw new Error("You can only delete your own comments");
      }

      await context.prisma.shoppingItemComment.delete({ where: { id: args.id } });
      return true;
    },

    markShoppingItemCommentsRead: async (
      _parent: unknown,
      args: { shoppingItemId: string },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      await assertShoppingItemInHousehold(context, args.shoppingItemId, householdId);
      await markCommentsRead(context, args.shoppingItemId, userId);
      return true;
    },
  },

  ShoppingItem: {
    ...timestampFields,
    purchasedAt: (parent: { purchasedAt?: Date | null }) => toIsoString(parent.purchasedAt),
    commentCount: (parent: { _count?: { comments: number } }) =>
      parent._count?.comments ?? 0,
    unreadCommentCount: async (
      parent: { id: string },
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user?.id) {
        return 0;
      }
      const read = await context.prisma.shoppingItemCommentRead.findUnique({
        where: {
          userId_shoppingItemId: {
            userId: context.user.id,
            shoppingItemId: parent.id,
          },
        },
      });
      return context.prisma.shoppingItemComment.count({
        where: {
          shoppingItemId: parent.id,
          createdAt: { gt: read?.readAt ?? new Date(0) },
        },
      });
    },
  },

  ShoppingItemComment: {
    createdAt: timestampFields.createdAt,
    canDelete: (
      parent: { authorId: string },
      _args: unknown,
      context: GraphQLContext,
    ) => Boolean(context.user?.id && parent.authorId === context.user.id),
  },
};
