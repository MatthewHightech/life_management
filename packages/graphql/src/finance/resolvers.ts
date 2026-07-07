import { BudgetLineType, Prisma } from "@prisma/client";
import {
  ANNUAL_SPEND_MONTH,
  budgetRemainingCents,
  budgetRemainingPercent,
  getBudgetCalendarPeriod,
  spendMonthKey,
} from "@life/shared";
import { GraphQLContext } from "../context";
import { ForbiddenError, requireHouseholdUser } from "../auth";

type SpendLookup = Map<string, number>;

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

function spendRecordKey(lineItemId: string, year: number, month: number) {
  return `${lineItemId}:${year}:${month}`;
}

function buildSpendLookup(
  records: { lineItemId: string; year: number; month: number; spentCents: number }[],
): SpendLookup {
  return new Map(records.map((record) => [spendRecordKey(record.lineItemId, record.year, record.month), record.spentCents]));
}

function spentForLineItem(
  lookup: SpendLookup,
  lineItem: { id: string; type: BudgetLineType },
  year: number,
  month: number,
) {
  const spendMonth = spendMonthKey(lineItem.type, year, month);
  return lookup.get(spendRecordKey(lineItem.id, year, spendMonth)) ?? 0;
}

function toLineItemGraph(
  lineItem: BudgetSectionRecord["lineItems"][number],
  lookup: SpendLookup,
  year: number,
  month: number,
) {
  const spentCents = spentForLineItem(lookup, lineItem, year, month);
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

function toSectionGraph(section: BudgetSectionRecord, lookup: SpendLookup, year: number, month: number) {
  const lineItems = section.lineItems.map((item) => toLineItemGraph(item, lookup, year, month));
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
    select: { id: true, sectionId: true },
  });

  if (!lineItem) {
    throw new ForbiddenError("Budget line item not found in household");
  }

  return lineItem;
}

async function loadSpendLookup(context: GraphQLContext, lineItemIds: string[], year: number, month: number) {
  if (lineItemIds.length === 0) {
    return buildSpendLookup([]);
  }

  const spendRecords = await context.prisma.budgetLineSpend.findMany({
    where: {
      lineItemId: { in: lineItemIds },
      year,
      month: {
        in: [month, ANNUAL_SPEND_MONTH],
      },
    },
  });

  return buildSpendLookup(spendRecords);
}

async function loadSectionsForScope(context: GraphQLContext, householdId: string, scope: BudgetLineType) {
  const period = getBudgetCalendarPeriod();
  const sections = await context.prisma.budgetSection.findMany({
    where: { householdId, scope },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      lineItems: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  const lineItemIds = sections.flatMap((section) => section.lineItems.map((item) => item.id));
  const lookup = await loadSpendLookup(context, lineItemIds, period.year, period.month);

  return sections.map((section) => toSectionGraph(section, lookup, period.year, period.month));
}

async function loadBudgetMonth(context: GraphQLContext, householdId: string) {
  const period = getBudgetCalendarPeriod();
  const [monthlySections, annualSections] = await Promise.all([
    loadSectionsForScope(context, householdId, BudgetLineType.MONTHLY),
    loadSectionsForScope(context, householdId, BudgetLineType.ANNUAL),
  ]);

  return {
    year: period.year,
    month: period.month,
    title: period.title,
    annualTitle: period.annualTitle,
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

  const lookup = await loadSpendLookup(
    context,
    section.lineItems.map((item) => item.id),
    period.year,
    period.month,
  );

  return toSectionGraph(section, lookup, period.year, period.month);
}

async function loadLineItemGraph(context: GraphQLContext, householdId: string, lineItemId: string) {
  const period = getBudgetCalendarPeriod();
  const lineItem = await context.prisma.budgetLineItem.findFirst({
    where: { id: lineItemId, householdId },
  });

  if (!lineItem) {
    throw new ForbiddenError("Budget line item not found in household");
  }

  const lookup = await loadSpendLookup(context, [lineItem.id], period.year, period.month);
  return toLineItemGraph(lineItem, lookup, period.year, period.month);
}

function validateAmountCents(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new ForbiddenError("Amount must be zero or greater");
  }
}

export const financeResolvers = {
  Query: {
    budgetMonth: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return loadBudgetMonth(context, householdId);
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
  },
};
