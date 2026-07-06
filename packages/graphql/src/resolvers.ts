import { GraphQLContext } from "./context";
import { folderResolvers } from "./folders/resolvers";
import { mealResolvers } from "./meals/resolvers";
import { gearResolvers } from "./gear/resolvers";
import { receiptResolvers } from "./receipts/resolvers";
import { taskResolvers } from "./tasks/resolvers";

export const resolvers = {
  Query: {
    health: () => "ok",
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user?.id) {
        return null;
      }

      return context.prisma.user.findUnique({
        where: { id: context.user.id },
        include: { household: true },
      });
    },
    household: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user?.id) {
        return null;
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.id },
        select: { householdId: true },
      });

      if (!user?.householdId) {
        return null;
      }

      return context.prisma.household.findUnique({
        where: { id: user.householdId },
        include: { users: true },
      });
    },
    ...taskResolvers.Query,
    ...mealResolvers.Query,
    ...receiptResolvers.Query,
    ...gearResolvers.Query,
  },
  Mutation: {
    ping: () => "pong",
    ...taskResolvers.Mutation,
    ...folderResolvers.Mutation,
    ...mealResolvers.Mutation,
    ...receiptResolvers.Mutation,
    ...gearResolvers.Mutation,
  },
  User: {
    household: (
      parent: { household?: unknown; householdId?: string | null },
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (parent.household) {
        return parent.household;
      }

      if (!parent.householdId) {
        return null;
      }

      return context.prisma.household.findUnique({
        where: { id: parent.householdId },
      });
    },
  },
  Household: {
    users: (parent: { users?: unknown[]; id: string }, _args: unknown, context: GraphQLContext) => {
      if (parent.users) {
        return parent.users;
      }

      return context.prisma.user.findMany({
        where: { householdId: parent.id },
      });
    },
  },
  Task: taskResolvers.Task,
  TaskComment: taskResolvers.TaskComment,
  TaskProject: taskResolvers.TaskProject,
  Recipe: mealResolvers.Recipe,
  Folder: folderResolvers.Folder,
  Receipt: receiptResolvers.Receipt,
  GearItem: gearResolvers.GearItem,
  GearVariant: gearResolvers.GearVariant,
  GearItemClass: gearResolvers.GearItemClass,
  GearLoan: gearResolvers.GearLoan,
  GearLoanItem: gearResolvers.GearLoanItem,
};
