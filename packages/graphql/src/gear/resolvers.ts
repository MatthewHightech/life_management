import { FolderNamespace, GearCondition, Prisma } from "@prisma/client";
import {
  canLendGearCondition,
  validateBorrowerEmail,
  validateLoanDates,
} from "@life/shared";
import { GraphQLContext } from "../context";
import { ForbiddenError, found, requireHouseholdUser } from "../auth";
import {
  optionalText,
  optionalTextUpdate,
  requiredTextUpdate,
  requireText,
  timestampFields,
  toIsoDate,
} from "../fields";
import { assertFolderInHousehold, loadFoldersForNamespace } from "../folders/helpers";

const NAME_REQUIRED = "Name is required";

const loanInclude = {
  items: { include: { gearItem: true, gearVariant: true } },
} satisfies Prisma.GearLoanInclude;

type LoanTarget = { gearItemId: string } | { gearVariantId: string };

async function loadOnLoanIds(context: GraphQLContext, householdId: string) {
  const rows = await context.prisma.gearLoanItem.findMany({
    where: { loan: { householdId, returnedAt: null } },
    select: { gearItemId: true, gearVariantId: true },
  });

  return new Set(rows.flatMap((row) => [row.gearItemId, row.gearVariantId]).filter(Boolean));
}

async function isOnActiveLoan(context: GraphQLContext, householdId: string, target: LoanTarget) {
  const loanItem = await context.prisma.gearLoanItem.findFirst({
    where: { loan: { householdId, returnedAt: null }, ...target },
    select: { id: true },
  });
  return Boolean(loanItem);
}

async function assertNotOnActiveLoan(context: GraphQLContext, householdId: string, target: LoanTarget) {
  if (await isOnActiveLoan(context, householdId, target)) {
    throw new ForbiddenError("Item is on an active loan");
  }
}

function parseDateOnly(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ForbiddenError(`${field} is invalid`);
  }
  return date;
}

function todayDateOnly(): Date {
  return new Date(`${toIsoDate(new Date())}T00:00:00.000Z`);
}

async function findGearItem(context: GraphQLContext, id: string, householdId: string) {
  return found(
    await context.prisma.gearItem.findFirst({ where: { id, householdId } }),
    "Gear item not found in household",
  );
}

async function findGearClass(context: GraphQLContext, id: string, householdId: string) {
  return found(
    await context.prisma.gearItemClass.findFirst({ where: { id, householdId } }),
    "Gear item class not found in household",
  );
}

async function findGearVariant(context: GraphQLContext, id: string, householdId: string) {
  return found(
    await context.prisma.gearVariant.findFirst({ where: { id, class: { householdId } } }),
    "Gear variant not found in household",
  );
}

async function assertGearFolder(
  context: GraphQLContext,
  folderId: string | null | undefined,
  householdId: string,
) {
  await assertFolderInHousehold(context, folderId, householdId, FolderNamespace.GEAR);
}

export const gearResolvers = {
  Query: {
    gearLibrary: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);

      const [onLoanIds, folders, items, classes] = await Promise.all([
        loadOnLoanIds(context, householdId),
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

      const withOnLoanFlag = <T extends { id: string }>(entity: T) => ({
        ...entity,
        isOnLoan: onLoanIds.has(entity.id),
      });

      return {
        folders,
        items: items.map(withOnLoanFlag),
        classes: classes.map((itemClass) => ({
          ...itemClass,
          variants: itemClass.variants.map(withOnLoanFlag),
        })),
      };
    },

    gearLending: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const loans = await context.prisma.gearLoan.findMany({
        where: { householdId },
        include: loanInclude,
        orderBy: [{ returnBy: "asc" }, { createdAt: "desc" }],
      });

      return {
        activeLoans: loans.filter((loan) => loan.returnedAt === null),
        loanHistory: loans.filter((loan) => loan.returnedAt !== null),
      };
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
      const name = requireText(input.name, NAME_REQUIRED);
      await assertGearFolder(context, input.folderId, householdId);

      const item = await context.prisma.gearItem.create({
        data: {
          householdId,
          folderId: input.folderId ?? null,
          name,
          description: optionalText(input.description),
          size: optionalText(input.size),
          careInstructions: optionalText(input.careInstructions),
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
      const { input } = args;
      await findGearItem(context, args.id, householdId);
      await assertGearFolder(context, input.folderId, householdId);

      const item = await context.prisma.gearItem.update({
        where: { id: args.id },
        data: {
          name: requiredTextUpdate(input.name, NAME_REQUIRED),
          description: optionalTextUpdate(input.description),
          size: optionalTextUpdate(input.size),
          careInstructions: optionalTextUpdate(input.careInstructions),
          condition: input.condition ?? undefined,
          folderId: input.folderId,
        },
      });
      return { ...item, isOnLoan: await isOnActiveLoan(context, householdId, { gearItemId: item.id }) };
    },

    deleteGearItem: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const item = await findGearItem(context, args.id, householdId);
      await assertNotOnActiveLoan(context, householdId, { gearItemId: item.id });

      await context.prisma.gearItem.delete({ where: { id: args.id } });
      if (item.photoStorageKey) {
        await context.deleteStoredFile?.(item.photoStorageKey);
      }
      return true;
    },

    moveGearItemToFolder: async (
      _parent: unknown,
      args: { gearItemId: string; folderId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await findGearItem(context, args.gearItemId, householdId);
      await assertGearFolder(context, args.folderId, householdId);

      const item = await context.prisma.gearItem.update({
        where: { id: args.gearItemId },
        data: { folderId: args.folderId ?? null },
      });
      return { ...item, isOnLoan: await isOnActiveLoan(context, householdId, { gearItemId: item.id }) };
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
      const { input } = args;
      const name = requireText(input.name, NAME_REQUIRED);
      await assertGearFolder(context, input.folderId, householdId);

      return context.prisma.gearItemClass.create({
        data: {
          householdId,
          folderId: input.folderId ?? null,
          name,
          description: optionalText(input.description),
          careInstructions: optionalText(input.careInstructions),
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
      const { input } = args;
      await findGearClass(context, args.id, householdId);
      await assertGearFolder(context, input.folderId, householdId);

      return context.prisma.gearItemClass.update({
        where: { id: args.id },
        data: {
          name: requiredTextUpdate(input.name, NAME_REQUIRED),
          description: optionalTextUpdate(input.description),
          careInstructions: optionalTextUpdate(input.careInstructions),
          folderId: input.folderId,
        },
        include: { variants: true },
      });
    },

    deleteGearItemClass: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await findGearClass(context, args.id, householdId);

      const variants = await context.prisma.gearVariant.findMany({
        where: { classId: args.id },
        select: { id: true, photoStorageKey: true },
      });
      for (const variant of variants) {
        await assertNotOnActiveLoan(context, householdId, { gearVariantId: variant.id });
      }

      await context.prisma.gearItemClass.delete({ where: { id: args.id } });
      for (const variant of variants) {
        if (variant.photoStorageKey) {
          await context.deleteStoredFile?.(variant.photoStorageKey);
        }
      }
      return true;
    },

    moveGearItemClassToFolder: async (
      _parent: unknown,
      args: { classId: string; folderId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await findGearClass(context, args.classId, householdId);
      await assertGearFolder(context, args.folderId, householdId);

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
      const { input } = args;
      await findGearClass(context, input.classId, householdId);

      const variant = await context.prisma.gearVariant.create({
        data: {
          classId: input.classId,
          name: requireText(input.name, NAME_REQUIRED),
          size: optionalText(input.size),
          condition: input.condition ?? GearCondition.GOOD,
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
      const { input } = args;
      await findGearVariant(context, args.id, householdId);

      const variant = await context.prisma.gearVariant.update({
        where: { id: args.id },
        data: {
          name: requiredTextUpdate(input.name, NAME_REQUIRED),
          size: optionalTextUpdate(input.size),
          condition: input.condition ?? undefined,
        },
      });
      return {
        ...variant,
        isOnLoan: await isOnActiveLoan(context, householdId, { gearVariantId: variant.id }),
      };
    },

    deleteGearVariant: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const variant = await findGearVariant(context, args.id, householdId);
      await assertNotOnActiveLoan(context, householdId, { gearVariantId: variant.id });

      await context.prisma.gearVariant.delete({ where: { id: args.id } });
      if (variant.photoStorageKey) {
        await context.deleteStoredFile?.(variant.photoStorageKey);
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

      const borrowerName = requireText(input.borrowerName, "Borrower name is required");
      const borrowerEmail = validateBorrowerEmail(input.borrowerEmail);
      const lentAt = input.lentAt ? parseDateOnly(input.lentAt, "Lent date") : todayDateOnly();
      const returnBy = parseDateOnly(input.returnBy, "Return-by date");
      validateLoanDates(lentAt, returnBy);

      const gearItemIds = [...new Set(input.gearItemIds)];
      const gearVariantIds = [...new Set(input.gearVariantIds)];

      if (gearItemIds.length === 0 && gearVariantIds.length === 0) {
        throw new ForbiddenError("At least one item is required to create a loan");
      }

      const [items, variants, onLoanIds] = await Promise.all([
        context.prisma.gearItem.findMany({
          where: { id: { in: gearItemIds }, householdId },
        }),
        context.prisma.gearVariant.findMany({
          where: { id: { in: gearVariantIds }, class: { householdId } },
        }),
        loadOnLoanIds(context, householdId),
      ]);

      if (items.length !== gearItemIds.length || variants.length !== gearVariantIds.length) {
        throw new ForbiddenError("One or more gear items were not found in household");
      }

      for (const entry of [...items, ...variants]) {
        if (!canLendGearCondition(entry.condition)) {
          throw new ForbiddenError(`"${entry.name}" is retired and cannot be lent`);
        }
        if (onLoanIds.has(entry.id)) {
          throw new ForbiddenError(`"${entry.name}" is already on loan`);
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
        include: loanInclude,
      });
    },

    markGearLoanReturned: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const loan = found(
        await context.prisma.gearLoan.findFirst({ where: { id: args.id, householdId } }),
        "Loan not found in household",
      );
      if (loan.returnedAt) {
        throw new ForbiddenError("Loan is already returned");
      }

      return context.prisma.gearLoan.update({
        where: { id: args.id },
        data: { returnedAt: new Date() },
        include: loanInclude,
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
    ...timestampFields,
    hasPhoto: (parent: { photoStorageKey?: string | null }) => Boolean(parent.photoStorageKey),
    isOnLoan: (parent: { isOnLoan?: boolean }) => parent.isOnLoan ?? false,
  },

  GearVariant: {
    ...timestampFields,
    hasPhoto: (parent: { photoStorageKey?: string | null }) => Boolean(parent.photoStorageKey),
    isOnLoan: (parent: { isOnLoan?: boolean }) => parent.isOnLoan ?? false,
  },

  GearItemClass: {
    ...timestampFields,
    variants: (parent: { variants?: unknown[] }) => parent.variants ?? [],
  },

  GearLoan: {
    ...timestampFields,
    lentAt: (parent: { lentAt: Date }) => toIsoDate(parent.lentAt),
    returnBy: (parent: { returnBy: Date }) => toIsoDate(parent.returnBy),
    returnedAt: (parent: { returnedAt: Date | null }) => parent.returnedAt?.toISOString() ?? null,
    isOverdue: (parent: { returnBy: Date; returnedAt: Date | null }) =>
      !parent.returnedAt && toIsoDate(parent.returnBy) < toIsoDate(new Date()),
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
