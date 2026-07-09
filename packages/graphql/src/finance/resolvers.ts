import { BudgetLineType, BudgetPurchaseSource, Prisma } from "@prisma/client";
import {
  budgetRemainingCents,
  budgetRemainingPercent,
  getBudgetCalendarPeriod,
  purchaseMatchesAnnualBudget,
  purchaseMatchesMonthlyBudget,
  spendMonthKey,
} from "@life/shared";
import { GraphQLContext } from "../context";
import { ForbiddenError, requireHouseholdUser } from "../auth";

type AllocationWithPurchase = {
  id: string;
  lineItemId: string;
  amountCents: number;
  purchase: {
    id: string;
    name: string;
    purchaseDate: Date;
    source: BudgetPurchaseSource;
    amountCents: number;
  };
};

type BudgetSectionRecord = {
  id: string;
  name: string;
  scope: BudgetLineType;
  lineItems: {
    id: string;
    sectionId: string;
    name: string;
    amountCents: number;
    type: BudgetLineType;
  }[];
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parsePurchaseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ForbiddenError("Purchase date must be YYYY-MM-DD");
  }

  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ForbiddenError("Invalid purchase date");
  }

  return parsed;
}

function spentFromAllocations(
  lineItem: { id: string; type: BudgetLineType },
  allocations: AllocationWithPurchase[],
  budgetYear: number,
  budgetMonth: number,
) {
  return allocations
    .filter((allocation) => allocation.lineItemId === lineItem.id)
    .filter((allocation) =>
      lineItem.type === BudgetLineType.MONTHLY
        ? purchaseMatchesMonthlyBudget(allocation.purchase.purchaseDate, budgetYear, budgetMonth)
        : purchaseMatchesAnnualBudget(allocation.purchase.purchaseDate, budgetYear),
    )
    .reduce((sum, allocation) => sum + allocation.amountCents, 0);
}

function toLineItemGraph(
  lineItem: BudgetSectionRecord["lineItems"][number],
  allocations: AllocationWithPurchase[],
  budgetYear: number,
  budgetMonth: number,
) {
  const spentCents = spentFromAllocations(lineItem, allocations, budgetYear, budgetMonth);
  const remainingCents = budgetRemainingCents(lineItem.amountCents, spentCents);

  return {
    id: lineItem.id,
    sectionId: lineItem.sectionId,
    name: lineItem.name,
    amountCents: lineItem.amountCents,
    spentCents,
    remainingCents,
    progressPercent: budgetRemainingPercent(spentCents, lineItem.amountCents),
  };
}

function toSectionGraph(
  section: BudgetSectionRecord,
  allocations: AllocationWithPurchase[],
  budgetYear: number,
  budgetMonth: number,
) {
  const lineItems = section.lineItems.map((item) =>
    toLineItemGraph(item, allocations, budgetYear, budgetMonth),
  );
  const budgetCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0);
  const spentCents = lineItems.reduce((sum, item) => sum + item.spentCents, 0);
  const remainingCents = budgetRemainingCents(budgetCents, spentCents);

  return {
    id: section.id,
    name: section.name,
    lineItems,
    budgetCents,
    spentCents,
    remainingCents,
    progressPercent: budgetRemainingPercent(spentCents, budgetCents),
  };
}

function toPurchaseGraph(
  purchase: {
    id: string;
    name: string;
    amountCents: number;
    purchaseDate: Date;
    source: BudgetPurchaseSource;
  },
) {
  return {
    id: purchase.id,
    name: purchase.name,
    amountCents: purchase.amountCents,
    purchaseDate: toIsoDate(purchase.purchaseDate),
    source: purchase.source,
  };
}

function toAllocationGraph(allocation: AllocationWithPurchase) {
  return {
    id: allocation.id,
    purchaseId: allocation.purchase.id,
    lineItemId: allocation.lineItemId,
    amountCents: allocation.amountCents,
    purchaseName: allocation.purchase.name,
    purchaseDate: toIsoDate(allocation.purchase.purchaseDate),
    source: allocation.purchase.source,
  };
}

async function assertSectionInHousehold(context: GraphQLContext, id: string, householdId: string) {
  const section = await context.prisma.budgetSection.findFirst({
    where: { id, householdId },
    select: { id: true, scope: true },
  });

  if (!section) {
    throw new ForbiddenError("Budget section not found in household");
  }

  return section;
}

async function assertLineItemInHousehold(context: GraphQLContext, id: string, householdId: string) {
  const lineItem = await context.prisma.budgetLineItem.findFirst({
    where: { id, householdId },
    select: { id: true, sectionId: true, type: true },
  });

  if (!lineItem) {
    throw new ForbiddenError("Budget line item not found in household");
  }

  return lineItem;
}

async function assertPurchaseInHousehold(context: GraphQLContext, id: string, householdId: string) {
  const purchase = await context.prisma.budgetPurchase.findFirst({
    where: { id, householdId },
    include: { allocations: true },
  });

  if (!purchase) {
    throw new ForbiddenError("Purchase not found in household");
  }

  return purchase;
}

async function assertAllocationInHousehold(context: GraphQLContext, id: string, householdId: string) {
  const allocation = await context.prisma.budgetPurchaseAllocation.findFirst({
    where: { id, lineItem: { householdId } },
    include: { purchase: true },
  });

  if (!allocation) {
    throw new ForbiddenError("Purchase allocation not found in household");
  }

  return allocation;
}

async function loadHouseholdAllocations(context: GraphQLContext, householdId: string) {
  return context.prisma.budgetPurchaseAllocation.findMany({
    where: { lineItem: { householdId } },
    include: {
      purchase: true,
    },
  });
}

async function loadSectionsForScope(
  context: GraphQLContext,
  householdId: string,
  scope: BudgetLineType,
  allocations: AllocationWithPurchase[],
  budgetYear: number,
  budgetMonth: number,
) {
  const sections = await context.prisma.budgetSection.findMany({
    where: { householdId, scope },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      lineItems: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return sections.map((section) => toSectionGraph(section, allocations, budgetYear, budgetMonth));
}

async function loadInboxPurchases(
  context: GraphQLContext,
  householdId: string,
  budgetYear: number,
  budgetMonth: number,
) {
  const purchases = await context.prisma.budgetPurchase.findMany({
    where: { householdId },
    include: { allocations: true },
    orderBy: [{ purchaseDate: "desc" }, { createdAt: "desc" }],
  });

  return purchases
    .filter((purchase) => purchaseMatchesMonthlyBudget(purchase.purchaseDate, budgetYear, budgetMonth))
    .filter((purchase) => purchase.allocations.length === 0)
    .map((purchase) => toPurchaseGraph(purchase));
}

async function loadBudgetMonth(context: GraphQLContext, householdId: string) {
  const period = getBudgetCalendarPeriod();
  const allocations = await loadHouseholdAllocations(context, householdId);
  const [monthlySections, annualSections, purchases] = await Promise.all([
    loadSectionsForScope(
      context,
      householdId,
      BudgetLineType.MONTHLY,
      allocations,
      period.year,
      period.month,
    ),
    loadSectionsForScope(
      context,
      householdId,
      BudgetLineType.ANNUAL,
      allocations,
      period.year,
      period.month,
    ),
    loadInboxPurchases(context, householdId, period.year, period.month),
  ]);

  return {
    year: period.year,
    month: period.month,
    title: period.title,
    annualTitle: period.annualTitle,
    purchases,
    monthlySections,
    annualSections,
  };
}

async function loadSectionGraph(context: GraphQLContext, householdId: string, sectionId: string) {
  const period = getBudgetCalendarPeriod();
  const section = await context.prisma.budgetSection.findFirst({
    where: { id: sectionId, householdId },
    include: {
      lineItems: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!section) {
    throw new ForbiddenError("Budget section not found in household");
  }

  const allocations = await loadHouseholdAllocations(context, householdId);
  return toSectionGraph(section, allocations, period.year, period.month);
}

async function loadLineItemGraph(context: GraphQLContext, householdId: string, lineItemId: string) {
  const period = getBudgetCalendarPeriod();
  const lineItem = await context.prisma.budgetLineItem.findFirst({
    where: { id: lineItemId, householdId },
  });

  if (!lineItem) {
    throw new ForbiddenError("Budget line item not found in household");
  }

  const allocations = await loadHouseholdAllocations(context, householdId);
  return toLineItemGraph(lineItem, allocations, period.year, period.month);
}

function validateAmountCents(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new ForbiddenError("Amount must be zero or greater");
  }
}

function validatePositiveAmountCents(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new ForbiddenError("Amount must be greater than zero");
  }
}

async function loadLineAllocations(
  context: GraphQLContext,
  householdId: string,
  lineItemId: string,
) {
  const lineItem = await assertLineItemInHousehold(context, lineItemId, householdId);
  const period = getBudgetCalendarPeriod();
  const allocations = await context.prisma.budgetPurchaseAllocation.findMany({
    where: { lineItemId },
    include: { purchase: true },
    orderBy: [{ purchase: { purchaseDate: "desc" } }, { createdAt: "desc" }],
  });

  return allocations
    .filter((allocation) =>
      lineItem.type === BudgetLineType.MONTHLY
        ? purchaseMatchesMonthlyBudget(
            allocation.purchase.purchaseDate,
            period.year,
            period.month,
          )
        : purchaseMatchesAnnualBudget(allocation.purchase.purchaseDate, period.year),
    )
    .map(toAllocationGraph);
}

export const financeResolvers = {
  Query: {
    budgetMonth: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return loadBudgetMonth(context, householdId);
    },

    budgetLineAllocations: async (
      _parent: unknown,
      args: { lineItemId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      return loadLineAllocations(context, householdId, args.lineItemId);
    },
  },

  Mutation: {
    createBudgetSection: async (
      _parent: unknown,
      args: { name: string; scope: BudgetLineType },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const name = args.name.trim();
      if (!name) {
        throw new ForbiddenError("Section name is required");
      }

      const section = await context.prisma.budgetSection.create({
        data: {
          householdId,
          name,
          scope: args.scope,
        },
      });

      return loadSectionGraph(context, householdId, section.id);
    },

    updateBudgetSection: async (
      _parent: unknown,
      args: { id: string; name: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertSectionInHousehold(context, args.id, householdId);

      const name = args.name.trim();
      if (!name) {
        throw new ForbiddenError("Section name is required");
      }

      await context.prisma.budgetSection.update({
        where: { id: args.id },
        data: { name },
      });

      return loadSectionGraph(context, householdId, args.id);
    },

    deleteBudgetSection: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertSectionInHousehold(context, args.id, householdId);

      await context.prisma.budgetSection.delete({ where: { id: args.id } });
      return true;
    },

    createBudgetLineItem: async (
      _parent: unknown,
      args: {
        input: {
          sectionId: string;
          name: string;
          amountCents: number;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const section = await assertSectionInHousehold(context, args.input.sectionId, householdId);

      const name = args.input.name.trim();
      if (!name) {
        throw new ForbiddenError("Line item name is required");
      }

      validateAmountCents(args.input.amountCents);

      const lineItem = await context.prisma.budgetLineItem.create({
        data: {
          householdId,
          sectionId: args.input.sectionId,
          name,
          amountCents: args.input.amountCents,
          type: section.scope,
        },
      });

      const period = getBudgetCalendarPeriod();
      await context.prisma.budgetLineSpend.createMany({
        data: [
          {
            lineItemId: lineItem.id,
            year: period.year,
            month: spendMonthKey(lineItem.type, period.year, period.month),
            spentCents: 0,
          },
        ],
        skipDuplicates: true,
      });

      return loadLineItemGraph(context, householdId, lineItem.id);
    },

    updateBudgetLineItem: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          name?: string | null;
          amountCents?: number | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const existing = await context.prisma.budgetLineItem.findFirst({
        where: { id: args.id, householdId },
      });

      if (!existing) {
        throw new ForbiddenError("Budget line item not found in household");
      }

      const data: Prisma.BudgetLineItemUpdateInput = {};

      if (args.input.name !== undefined && args.input.name !== null) {
        const name = args.input.name.trim();
        if (!name) {
          throw new ForbiddenError("Line item name is required");
        }
        data.name = name;
      }

      if (args.input.amountCents !== undefined && args.input.amountCents !== null) {
        validateAmountCents(args.input.amountCents);
        data.amountCents = args.input.amountCents;
      }

      if (Object.keys(data).length === 0) {
        return loadLineItemGraph(context, householdId, args.id);
      }

      await context.prisma.budgetLineItem.update({
        where: { id: args.id },
        data,
      });

      return loadLineItemGraph(context, householdId, args.id);
    },

    deleteBudgetLineItem: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertLineItemInHousehold(context, args.id, householdId);

      await context.prisma.budgetLineItem.delete({ where: { id: args.id } });
      return true;
    },

    createBudgetPurchase: async (
      _parent: unknown,
      args: {
        input: {
          name: string;
          amountCents: number;
          purchaseDate: string;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const name = args.input.name.trim();
      if (!name) {
        throw new ForbiddenError("Purchase name is required");
      }

      validatePositiveAmountCents(args.input.amountCents);
      const purchaseDate = parsePurchaseDate(args.input.purchaseDate);

      const purchase = await context.prisma.budgetPurchase.create({
        data: {
          householdId,
          name,
          amountCents: args.input.amountCents,
          purchaseDate,
          source: BudgetPurchaseSource.MANUAL,
        },
        include: { allocations: true },
      });

      return toPurchaseGraph(purchase);
    },

    updateBudgetPurchase: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          name?: string | null;
          amountCents?: number | null;
          purchaseDate?: string | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const existing = await assertPurchaseInHousehold(context, args.id, householdId);

      if (existing.source !== BudgetPurchaseSource.MANUAL) {
        throw new ForbiddenError("Only manual purchases can be edited");
      }

      const data: Prisma.BudgetPurchaseUpdateInput = {};

      if (args.input.name !== undefined && args.input.name !== null) {
        const name = args.input.name.trim();
        if (!name) {
          throw new ForbiddenError("Purchase name is required");
        }
        data.name = name;
      }

      if (args.input.amountCents !== undefined && args.input.amountCents !== null) {
        validatePositiveAmountCents(args.input.amountCents);
        data.amountCents = args.input.amountCents;
      }

      if (args.input.purchaseDate !== undefined && args.input.purchaseDate !== null) {
        data.purchaseDate = parsePurchaseDate(args.input.purchaseDate);
      }

      if (Object.keys(data).length === 0) {
        return toPurchaseGraph(existing);
      }

      const purchase = await context.prisma.$transaction(async (tx) => {
        const updated = await tx.budgetPurchase.update({
          where: { id: args.id },
          data,
          include: { allocations: true },
        });

        if (
          args.input.amountCents !== undefined &&
          args.input.amountCents !== null &&
          updated.allocations.length === 1
        ) {
          await tx.budgetPurchaseAllocation.update({
            where: { id: updated.allocations[0].id },
            data: { amountCents: args.input.amountCents },
          });
        }

        return updated;
      });

      return toPurchaseGraph(purchase);
    },

    deleteBudgetPurchase: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertPurchaseInHousehold(context, args.id, householdId);

      await context.prisma.budgetPurchase.delete({ where: { id: args.id } });
      return true;
    },

    allocateBudgetPurchase: async (
      _parent: unknown,
      args: { purchaseId: string; lineItemId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const purchase = await assertPurchaseInHousehold(context, args.purchaseId, householdId);
      await assertLineItemInHousehold(context, args.lineItemId, householdId);

      if (purchase.allocations.length > 0) {
        throw new ForbiddenError("Purchase is already assigned to a budget line");
      }

      const allocation = await context.prisma.budgetPurchaseAllocation.create({
        data: {
          purchaseId: purchase.id,
          lineItemId: args.lineItemId,
          amountCents: purchase.amountCents,
        },
        include: { purchase: true },
      });

      return toAllocationGraph(allocation);
    },

    deleteBudgetPurchaseAllocation: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertAllocationInHousehold(context, args.id, householdId);

      await context.prisma.budgetPurchaseAllocation.delete({ where: { id: args.id } });
      return true;
    },
  },
};
