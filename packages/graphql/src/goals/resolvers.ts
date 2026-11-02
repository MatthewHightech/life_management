import type { Goal, GoalCadence, GoalSet, User } from "@prisma/client";
import {
  archiveHitRate,
  archiveStreak,
  goalLimit,
  goalPeriodLabel,
  type GoalCadence as SharedCadence,
} from "@life/shared";
import { GraphQLContext } from "../context";
import { ForbiddenError, requireHouseholdUser } from "../auth";

type GoalSetWithGoals = GoalSet & {
  goals: Goal[];
  user?: User;
};

function asSharedCadence(cadence: GoalCadence): SharedCadence {
  return cadence;
}

function serializeGoal(goal: Goal) {
  return {
    ...goal,
    completedAt: goal.completedAt?.toISOString() ?? null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

function serializeGoalSet(set: GoalSetWithGoals) {
  const completedCount = set.goals.filter((goal) => goal.completedAt).length;
  const totalCount = set.goals.length;

  return {
    ...set,
    label: set.label,
    archivedAt: set.archivedAt?.toISOString() ?? null,
    createdAt: set.createdAt.toISOString(),
    goals: set.goals.map(serializeGoal),
    completedCount,
    totalCount,
    isComplete: totalCount > 0 && completedCount >= totalCount,
  };
}

function cadenceStats(cadence: GoalCadence, setsNewestFirst: GoalSetWithGoals[]) {
  const inputs = setsNewestFirst.map((set) => ({
    totalCount: set.goals.length,
    completedCount: set.goals.filter((goal) => goal.completedAt).length,
  }));

  return {
    cadence,
    hitRate: archiveHitRate(inputs),
    streak: archiveStreak(inputs),
    archivedSetCount: setsNewestFirst.length,
  };
}

async function loadHouseholdMembers(context: GraphQLContext, householdId: string) {
  return context.prisma.user.findMany({
    where: { householdId },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
}

async function loadCurrentSets(context: GraphQLContext, householdId: string) {
  return context.prisma.goalSet.findMany({
    where: { householdId, archivedAt: null },
    include: {
      user: true,
      goals: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
    orderBy: [{ createdAt: "asc" }],
  });
}

async function assertOwnCurrentGoal(
  context: GraphQLContext,
  goalId: string,
  userId: string,
  householdId: string,
) {
  const goal = await context.prisma.goal.findFirst({
    where: {
      id: goalId,
      set: { householdId, userId, archivedAt: null },
    },
    include: { set: true },
  });

  if (!goal) {
    throw new ForbiddenError("Goal not found or not editable");
  }

  return goal;
}

async function getOrCreateCurrentSet(
  context: GraphQLContext,
  householdId: string,
  userId: string,
  cadence: GoalCadence,
) {
  const existing = await context.prisma.goalSet.findFirst({
    where: { householdId, userId, cadence, archivedAt: null },
    include: {
      user: true,
      goals: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (existing) {
    return existing;
  }

  return context.prisma.goalSet.create({
    data: {
      householdId,
      userId,
      cadence,
      label: goalPeriodLabel(asSharedCadence(cadence)),
    },
    include: {
      user: true,
      goals: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
}

export const goalResolvers = {
  Query: {
    currentGoals: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const [members, sets] = await Promise.all([
        loadHouseholdMembers(context, householdId),
        loadCurrentSets(context, householdId),
      ]);

      return {
        members,
        sets: sets.map(serializeGoalSet),
      };
    },

    pastGoals: async (
      _parent: unknown,
      args: { limit?: number | null; offset?: number | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const limit = Math.max(1, Math.min(args.limit ?? 4, 50));
      const offset = Math.max(0, args.offset ?? 0);

      const members = await loadHouseholdMembers(context, householdId);
      const archived = await context.prisma.goalSet.findMany({
        where: { householdId, archivedAt: { not: null } },
        include: {
          user: true,
          goals: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
        orderBy: [{ archivedAt: "desc" }, { createdAt: "desc" }],
      });

      const byCadence = {
        DAILY: archived.filter((set) => set.cadence === "DAILY"),
        WEEKLY: archived.filter((set) => set.cadence === "WEEKLY"),
        TERM: archived.filter((set) => set.cadence === "TERM"),
      };

      const page = (cadence: GoalCadence) => byCadence[cadence].slice(offset, offset + limit);
      const hasMore = (cadence: GoalCadence) => byCadence[cadence].length > offset + limit;

      const stats = members.map((user) => {
        const userSets = (cadence: GoalCadence) =>
          byCadence[cadence].filter((set) => set.userId === user.id);

        return {
          user,
          daily: cadenceStats("DAILY", userSets("DAILY")),
          weekly: cadenceStats("WEEKLY", userSets("WEEKLY")),
          term: cadenceStats("TERM", userSets("TERM")),
        };
      });

      return {
        stats,
        daily: page("DAILY").map(serializeGoalSet),
        weekly: page("WEEKLY").map(serializeGoalSet),
        term: page("TERM").map(serializeGoalSet),
        hasMoreDaily: hasMore("DAILY"),
        hasMoreWeekly: hasMore("WEEKLY"),
        hasMoreTerm: hasMore("TERM"),
      };
    },
  },

  Mutation: {
    createGoal: async (
      _parent: unknown,
      args: { cadence: GoalCadence; title: string },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const title = args.title.trim();
      if (!title) {
        throw new ForbiddenError("Goal title is required");
      }

      const set = await getOrCreateCurrentSet(context, householdId, userId, args.cadence);
      const limit = goalLimit(asSharedCadence(args.cadence));
      if (set.goals.length >= limit) {
        throw new ForbiddenError(`At most ${limit} ${args.cadence.toLowerCase()} goals allowed`);
      }

      await context.prisma.goal.create({
        data: {
          setId: set.id,
          title,
          sortOrder: set.goals.length,
        },
      });

      // Refresh period label if set was empty / stale naming is fine to refresh on add
      const updated = await context.prisma.goalSet.update({
        where: { id: set.id },
        data: { label: goalPeriodLabel(asSharedCadence(args.cadence)) },
        include: {
          user: true,
          goals: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      });

      return serializeGoalSet(updated);
    },

    updateGoal: async (
      _parent: unknown,
      args: { id: string; title: string },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const title = args.title.trim();
      if (!title) {
        throw new ForbiddenError("Goal title is required");
      }

      await assertOwnCurrentGoal(context, args.id, userId, householdId);
      const goal = await context.prisma.goal.update({
        where: { id: args.id },
        data: { title },
      });

      return serializeGoal(goal);
    },

    setGoalCompleted: async (
      _parent: unknown,
      args: { id: string; completed: boolean },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      await assertOwnCurrentGoal(context, args.id, userId, householdId);

      const goal = await context.prisma.goal.update({
        where: { id: args.id },
        data: { completedAt: args.completed ? new Date() : null },
      });

      return serializeGoal(goal);
    },

    deleteGoal: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      await assertOwnCurrentGoal(context, args.id, userId, householdId);
      await context.prisma.goal.delete({ where: { id: args.id } });
      return true;
    },

    resetGoals: async (
      _parent: unknown,
      args: { cadence: GoalCadence },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const current = await context.prisma.goalSet.findFirst({
        where: {
          householdId,
          userId,
          cadence: args.cadence,
          archivedAt: null,
        },
        include: { goals: true },
      });

      if (!current) {
        return true;
      }

      if (current.goals.length === 0) {
        await context.prisma.goalSet.delete({ where: { id: current.id } });
        return true;
      }

      await context.prisma.goalSet.update({
        where: { id: current.id },
        data: {
          archivedAt: new Date(),
          label: goalPeriodLabel(asSharedCadence(args.cadence)),
        },
      });

      return true;
    },
  },

  GoalSet: {
    user: (parent: GoalSetWithGoals, _args: unknown, context: GraphQLContext) => {
      if (parent.user) {
        return parent.user;
      }
      return context.prisma.user.findUniqueOrThrow({ where: { id: parent.userId } });
    },
  },
};
