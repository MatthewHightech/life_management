import { GearCondition, FolderNamespace } from "@prisma/client";
import {
  canLendGearCondition,
  validateBorrowerEmail,
  validateLoanDates,
} from "@life/shared";
import { GraphQLContext } from "../context";
import { ForbiddenError, requireHouseholdUser } from "../auth";
import { assertFolderInHousehold, loadFoldersForNamespace } from "../folders/helpers";

type OnLoanSets = {
  itemIds: Set<string>;
  variantIds: Set<string>;
};

async function loadOnLoanSets(context: GraphQLContext, householdId: string): Promise<OnLoanSets> {
  const rows = await context.prisma.gearLoanItem.findMany({
    where: { loan: { householdId, returnedAt: null } },
    select: { gearItemId: true, gearVariantId: true },
  });

  return {
    itemIds: new Set(rows.map((row) => row.gearItemId).filter((id): id is string => Boolean(id))),
    variantIds: new Set(
      rows.map((row) => row.gearVariantId).filter((id): id is string => Boolean(id)),
    ),
  };
}

function parseDateOnly(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ForbiddenError(`${field} is invalid`);
  }
  return date;
}

function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function assertGearItemInHousehold(
  context: GraphQLContext,
  id: string,
  householdId: string,
) {
  const item = await context.prisma.gearItem.findFirst({
    where: { id, householdId },
    select: { id: true },
  });
  if (!item) {
    throw new ForbiddenError("Gear item not found in household");
  }
}

async function assertGearClassInHousehold(
  context: GraphQLContext,
  id: string,
  householdId: string,
) {
  const itemClass = await context.prisma.gearItemClass.findFirst({
    where: { id, householdId },
    select: { id: true },
  });
  if (!itemClass) {
    throw new ForbiddenError("Gear item class not found in household");
  }
}

async function assertGearVariantInHousehold(
  context: GraphQLContext,
  id: string,
  householdId: string,
) {
  const variant = await context.prisma.gearVariant.findFirst({
    where: { id, class: { householdId } },
    select: { id: true, classId: true },
  });
  if (!variant) {
    throw new ForbiddenError("Gear variant not found in household");
  }
  return variant;
}

async function assertNotOnActiveLoan(
  context: GraphQLContext,
  householdId: string,
  gearItemId?: string | null,
  gearVariantId?: string | null,
) {
  const onLoan = await context.prisma.gearLoanItem.findFirst({
    where: {
      loan: { householdId, returnedAt: null },
      OR: [
        gearItemId ? { gearItemId } : undefined,
        gearVariantId ? { gearVariantId } : undefined,
      ].filter(Boolean) as { gearItemId?: string; gearVariantId?: string }[],
    },
    select: { id: true },
  });

  if (onLoan) {
    throw new ForbiddenError("Item is on an active loan");
  }
}

function withOnLoanFlag<T extends { id: string }>(
  entity: T,
  onLoan: OnLoanSets,
  kind: "item" | "variant",
): T & { isOnLoan: boolean } {
  const isOnLoan =
    kind === "item" ? onLoan.itemIds.has(entity.id) : onLoan.variantIds.has(entity.id);
  return { ...entity, isOnLoan };
}

export const gearResolvers = {
  Query: {
    gearLibrary: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const onLoan = await loadOnLoanSets(context, householdId);

      const [folders, items, classes] = await Promise.all([
        loadFoldersForNamespace(context, householdId, FolderNamespace.GEAR),
        context.prisma.gearItem.findMany({
          where: { householdId },
          orderBy: [{ name: "asc" }],
        }),
        context.prisma.gearItemClass.findMany({
          where: { householdId },
          include: { variants: { orderBy: [{ name: "asc" }] } },
          orderBy: [{ name: "asc" }],
        }),
      ]);

      return {
        folders,
        items: items.map((item) => withOnLoanFlag(item, onLoan, "item")),
        classes: classes.map((itemClass) => ({
          ...itemClass,
          variants: itemClass.variants.map((variant) =>
            withOnLoanFlag(variant, onLoan, "variant"),
          ),
        })),
      };
    },

    gearLending: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const loans = await context.prisma.gearLoan.findMany({
        where: { householdId },
        include: {
          items: {
            include: {
              gearItem: true,
              gearVariant: true,
            },
          },
        },
        orderBy: [{ returnBy: "asc" }, { createdAt: "desc" }],
      });

      const activeLoans = loans.filter((loan) => loan.returnedAt === null);
      const loanHistory = loans.filter((loan) => loan.returnedAt !== null);

      return { activeLoans, loanHistory };
    },
  },

  Mutation: {
    createGearItem: async (
      _parent: unknown,
      args: {
        input: {
          name: string;
          description?: string | null;
          size?: string | null;
          careInstructions?: string | null;
          condition?: GearCondition | null;
          folderId?: string | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const { input } = args;
      const name = input.name.trim();
      if (!name) {
        throw new ForbiddenError("Name is required");
      }

      if (input.folderId) {
        await assertFolderInHousehold(context, input.folderId, householdId, FolderNamespace.GEAR);
      }

      const item = await context.prisma.gearItem.create({
        data: {
          householdId,
          folderId: input.folderId ?? null,
          name,
          description: input.description?.trim() || null,
          size: input.size?.trim() || null,
          careInstructions: input.careInstructions?.trim() || null,
          condition: input.condition ?? GearCondition.GOOD,
        },
      });

      return { ...item, isOnLoan: false };
    },

    updateGearItem: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          name?: string | null;
          description?: string | null;
          size?: string | null;
          careInstructions?: string | null;
          condition?: GearCondition | null;
          folderId?: string | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertGearItemInHousehold(context, args.id, householdId);

      if (args.input.folderId) {
        await assertFolderInHousehold(
          context,
          args.input.folderId,
          householdId,
          FolderNamespace.GEAR,
        );
      }

      const data: {
        name?: string;
        description?: string | null;
        size?: string | null;
        careInstructions?: string | null;
        condition?: GearCondition;
        folderId?: string | null;
      } = {};

      if (args.input.name !== undefined && args.input.name !== null) {
        const name = args.input.name.trim();
        if (!name) {
          throw new ForbiddenError("Name is required");
        }
        data.name = name;
      }
      if (args.input.description !== undefined) {
        data.description = args.input.description?.trim() || null;
      }
      if (args.input.size !== undefined) {
        data.size = args.input.size?.trim() || null;
      }
      if (args.input.careInstructions !== undefined) {
        data.careInstructions = args.input.careInstructions?.trim() || null;
      }
      if (args.input.condition !== undefined && args.input.condition !== null) {
        data.condition = args.input.condition;
      }
      if (args.input.folderId !== undefined) {
        data.folderId = args.input.folderId;
      }

      const item = await context.prisma.gearItem.update({
        where: { id: args.id },
        data,
      });
      const onLoan = await loadOnLoanSets(context, householdId);
      return withOnLoanFlag(item, onLoan, "item");
    },

    deleteGearItem: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const item = await context.prisma.gearItem.findFirst({
        where: { id: args.id, householdId },
      });
      if (!item) {
        throw new ForbiddenError("Gear item not found in household");
      }

      await assertNotOnActiveLoan(context, householdId, item.id, null);

      await context.prisma.gearItem.delete({ where: { id: args.id } });
      if (item.photoStorageKey) {
        await context.deleteGearPhoto?.(item.photoStorageKey);
      }
      return true;
    },

    moveGearItemToFolder: async (
      _parent: unknown,
      args: { gearItemId: string; folderId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertGearItemInHousehold(context, args.gearItemId, householdId);

      if (args.folderId) {
        await assertFolderInHousehold(
          context,
          args.folderId,
          householdId,
          FolderNamespace.GEAR,
        );
      }

      const item = await context.prisma.gearItem.update({
        where: { id: args.gearItemId },
        data: { folderId: args.folderId ?? null },
      });
      const onLoan = await loadOnLoanSets(context, householdId);
      return withOnLoanFlag(item, onLoan, "item");
    },

    createGearItemClass: async (
      _parent: unknown,
      args: {
        input: {
          name: string;
          description?: string | null;
          careInstructions?: string | null;
          folderId?: string | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const name = args.input.name.trim();
      if (!name) {
        throw new ForbiddenError("Name is required");
      }

      if (args.input.folderId) {
        await assertFolderInHousehold(
          context,
          args.input.folderId,
          householdId,
          FolderNamespace.GEAR,
        );
      }

      return context.prisma.gearItemClass.create({
        data: {
          householdId,
          folderId: args.input.folderId ?? null,
          name,
          description: args.input.description?.trim() || null,
          careInstructions: args.input.careInstructions?.trim() || null,
        },
        include: { variants: true },
      });
    },

    updateGearItemClass: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          name?: string | null;
          description?: string | null;
          careInstructions?: string | null;
          folderId?: string | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertGearClassInHousehold(context, args.id, householdId);

      if (args.input.folderId) {
        await assertFolderInHousehold(
          context,
          args.input.folderId,
          householdId,
          FolderNamespace.GEAR,
        );
      }

      const data: {
        name?: string;
        description?: string | null;
        careInstructions?: string | null;
        folderId?: string | null;
      } = {};

      if (args.input.name !== undefined && args.input.name !== null) {
        const name = args.input.name.trim();
        if (!name) {
          throw new ForbiddenError("Name is required");
        }
        data.name = name;
      }
      if (args.input.description !== undefined) {
        data.description = args.input.description?.trim() || null;
      }
      if (args.input.careInstructions !== undefined) {
        data.careInstructions = args.input.careInstructions?.trim() || null;
      }
      if (args.input.folderId !== undefined) {
        data.folderId = args.input.folderId;
      }

      return context.prisma.gearItemClass.update({
        where: { id: args.id },
        data,
        include: { variants: true },
      });
    },

    deleteGearItemClass: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const itemClass = await context.prisma.gearItemClass.findFirst({
        where: { id: args.id, householdId },
        include: { variants: true },
      });
      if (!itemClass) {
        throw new ForbiddenError("Gear item class not found in household");
      }

      for (const variant of itemClass.variants) {
        await assertNotOnActiveLoan(context, householdId, null, variant.id);
        if (variant.photoStorageKey) {
          await context.deleteGearPhoto?.(variant.photoStorageKey);
        }
      }

      await context.prisma.gearItemClass.delete({ where: { id: args.id } });
      return true;
    },

    moveGearItemClassToFolder: async (
      _parent: unknown,
      args: { classId: string; folderId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertGearClassInHousehold(context, args.classId, householdId);

      if (args.folderId) {
        await assertFolderInHousehold(
          context,
          args.folderId,
          householdId,
          FolderNamespace.GEAR,
        );
      }

      return context.prisma.gearItemClass.update({
        where: { id: args.classId },
        data: { folderId: args.folderId ?? null },
        include: { variants: true },
      });
    },

    createGearVariant: async (
      _parent: unknown,
      args: {
        input: {
          classId: string;
          name: string;
          size?: string | null;
          condition?: GearCondition | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertGearClassInHousehold(context, args.input.classId, householdId);
      const name = args.input.name.trim();
      if (!name) {
        throw new ForbiddenError("Name is required");
      }

      const variant = await context.prisma.gearVariant.create({
        data: {
          classId: args.input.classId,
          name,
          size: args.input.size?.trim() || null,
          condition: args.input.condition ?? GearCondition.GOOD,
        },
      });

      return { ...variant, isOnLoan: false };
    },

    updateGearVariant: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          name?: string | null;
          size?: string | null;
          condition?: GearCondition | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertGearVariantInHousehold(context, args.id, householdId);

      const data: { name?: string; size?: string | null; condition?: GearCondition } = {};
      if (args.input.name !== undefined && args.input.name !== null) {
        const name = args.input.name.trim();
        if (!name) {
          throw new ForbiddenError("Name is required");
        }
        data.name = name;
      }
      if (args.input.size !== undefined) {
        data.size = args.input.size?.trim() || null;
      }
      if (args.input.condition !== undefined && args.input.condition !== null) {
        data.condition = args.input.condition;
      }

      const variant = await context.prisma.gearVariant.update({
        where: { id: args.id },
        data,
      });
      const onLoan = await loadOnLoanSets(context, householdId);
      return withOnLoanFlag(variant, onLoan, "variant");
    },

    deleteGearVariant: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const variant = await context.prisma.gearVariant.findFirst({
        where: { id: args.id, class: { householdId } },
      });
      if (!variant) {
        throw new ForbiddenError("Gear variant not found in household");
      }

      await assertNotOnActiveLoan(context, householdId, null, variant.id);

      await context.prisma.gearVariant.delete({ where: { id: args.id } });
      if (variant.photoStorageKey) {
        await context.deleteGearPhoto?.(variant.photoStorageKey);
      }
      return true;
    },

    createGearLoan: async (
      _parent: unknown,
      args: {
        input: {
          borrowerName: string;
          borrowerEmail: string;
          lentAt?: string | null;
          returnBy: string;
          gearItemIds: string[];
          gearVariantIds: string[];
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const { input } = args;

      const borrowerName = input.borrowerName.trim();
      if (!borrowerName) {
        throw new ForbiddenError("Borrower name is required");
      }

      let borrowerEmail: string;
      try {
        borrowerEmail = validateBorrowerEmail(input.borrowerEmail);
      } catch (error) {
        throw new ForbiddenError(error instanceof Error ? error.message : "Invalid email");
      }

      const lentAt = input.lentAt ? parseDateOnly(input.lentAt, "Lent date") : todayDateOnly();
      const returnBy = parseDateOnly(input.returnBy, "Return-by date");

      try {
        validateLoanDates(lentAt, returnBy);
      } catch (error) {
        throw new ForbiddenError(error instanceof Error ? error.message : "Invalid loan dates");
      }

      const gearItemIds = [...new Set(input.gearItemIds)];
      const gearVariantIds = [...new Set(input.gearVariantIds)];

      if (gearItemIds.length === 0 && gearVariantIds.length === 0) {
        throw new ForbiddenError("At least one item is required to create a loan");
      }

      const [items, variants, onLoan] = await Promise.all([
        gearItemIds.length
          ? context.prisma.gearItem.findMany({
              where: { id: { in: gearItemIds }, householdId },
            })
          : Promise.resolve([]),
        gearVariantIds.length
          ? context.prisma.gearVariant.findMany({
              where: { id: { in: gearVariantIds }, class: { householdId } },
            })
          : Promise.resolve([]),
        loadOnLoanSets(context, householdId),
      ]);

      if (items.length !== gearItemIds.length || variants.length !== gearVariantIds.length) {
        throw new ForbiddenError("One or more gear items were not found in household");
      }

      for (const item of items) {
        if (!canLendGearCondition(item.condition)) {
          throw new ForbiddenError(`"${item.name}" is retired and cannot be lent`);
        }
        if (onLoan.itemIds.has(item.id)) {
          throw new ForbiddenError(`"${item.name}" is already on loan`);
        }
      }

      for (const variant of variants) {
        if (!canLendGearCondition(variant.condition)) {
          throw new ForbiddenError(`"${variant.name}" is retired and cannot be lent`);
        }
        if (onLoan.variantIds.has(variant.id)) {
          throw new ForbiddenError(`"${variant.name}" is already on loan`);
        }
      }

      return context.prisma.gearLoan.create({
        data: {
          householdId,
          borrowerName,
          borrowerEmail,
          lentAt,
          returnBy,
          items: {
            create: [
              ...gearItemIds.map((gearItemId) => ({ gearItemId })),
              ...gearVariantIds.map((gearVariantId) => ({ gearVariantId })),
            ],
          },
        },
        include: {
          items: {
            include: {
              gearItem: true,
              gearVariant: true,
            },
          },
        },
      });
    },

    markGearLoanReturned: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const loan = await context.prisma.gearLoan.findFirst({
        where: { id: args.id, householdId },
      });
      if (!loan) {
        throw new ForbiddenError("Loan not found in household");
      }
      if (loan.returnedAt) {
        throw new ForbiddenError("Loan is already returned");
      }

      return context.prisma.gearLoan.update({
        where: { id: args.id },
        data: { returnedAt: new Date() },
        include: {
          items: {
            include: {
              gearItem: true,
              gearVariant: true,
            },
          },
        },
      });
    },

    clearGearLoanHistory: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await context.prisma.gearLoan.deleteMany({
        where: { householdId, returnedAt: { not: null } },
      });
      return true;
    },
  },

  GearItem: {
    hasPhoto: (parent: { photoStorageKey?: string | null }) => Boolean(parent.photoStorageKey),
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
    isOnLoan: (parent: { isOnLoan?: boolean }) => parent.isOnLoan ?? false,
  },

  GearVariant: {
    hasPhoto: (parent: { photoStorageKey?: string | null }) => Boolean(parent.photoStorageKey),
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
    isOnLoan: (parent: { isOnLoan?: boolean }) => parent.isOnLoan ?? false,
  },

  GearItemClass: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
    variants: (parent: { variants?: unknown[] }) => parent.variants ?? [],
  },

  GearLoan: {
    lentAt: (parent: { lentAt: Date }) => parent.lentAt.toISOString().slice(0, 10),
    returnBy: (parent: { returnBy: Date }) => parent.returnBy.toISOString().slice(0, 10),
    returnedAt: (parent: { returnedAt: Date | null }) => parent.returnedAt?.toISOString() ?? null,
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
    isOverdue: (parent: { returnBy: Date; returnedAt: Date | null }) => {
      if (parent.returnedAt) {
        return false;
      }
      const today = todayDateOnly();
      const due = new Date(
        Date.UTC(
          parent.returnBy.getUTCFullYear(),
          parent.returnBy.getUTCMonth(),
          parent.returnBy.getUTCDate(),
        ),
      );
      return due < today;
    },
  },

  GearLoanItem: {
    displayName: (parent: {
      gearItem?: { name: string } | null;
      gearVariant?: { name: string } | null;
    }) => parent.gearItem?.name ?? parent.gearVariant?.name ?? "Unknown item",
    hasPhoto: (parent: {
      gearItem?: { photoStorageKey?: string | null } | null;
      gearVariant?: { photoStorageKey?: string | null } | null;
    }) =>
      Boolean(parent.gearItem?.photoStorageKey) || Boolean(parent.gearVariant?.photoStorageKey),
  },
};
