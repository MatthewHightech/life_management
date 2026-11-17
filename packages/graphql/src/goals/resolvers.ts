import type { Goal, GoalCadence, GoalSet, Prisma, User } from "@prisma/client";
import { archiveHitRate, archiveStreak, GOAL_LIMITS, goalPeriodLabel } from "@life/shared";
import { GraphQLContext } from "../context";
import { ForbiddenError, found, requireHouseholdUser } from "../auth";
import { requireText } from "../fields";

type GoalSetWithGoals = GoalSet & {
  goals: Goal[];
  user?: User;
};

const goalSetInclude = {
  user: true,
  goals: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
} satisfies Prisma.GoalSetInclude;

function goalCounts(set: GoalSetWithGoals) {
  return {
    totalCount: set.goals.length,
    completedCount: set.goals.filter((goal) => goal.completedAt).length,
  };
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
  const counts = goalCounts(set);

  return {
    ...set,
    ...counts,
    archivedAt: set.archivedAt?.toISOString() ?? null,
    createdAt: set.createdAt.toISOString(),
    goals: set.goals.map(serializeGoal),
    isComplete: counts.totalCount > 0 && counts.completedCount >= counts.totalCount,
  };
}

function cadenceStats(cadence: GoalCadence, setsNewestFirst: GoalSetWithGoals[]) {
  const inputs = setsNewestFirst.map(goalCounts);

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

async function assertOwnCurrentGoal(
  context: GraphQLContext,
  goalId: string,
  userId: string,
  householdId: string,
) {
  found(
    await context.prisma.goal.findFirst({
      where: { id: goalId, set: { householdId, userId, archivedAt: null } },
      select: { id: true },
    }),
    "Goal not found or not editable",
  );
}

async function getOrCreateCurrentSet(
  context: GraphQLContext,
  householdId: string,
  userId: string,
  cadence: GoalCadence,
) {
  const existing = await context.prisma.goalSet.findFirst({
    where: { householdId, userId, cadence, archivedAt: null },
    include: goalSetInclude,
  });

  return (
    existing ??
    context.prisma.goalSet.create({
      data: { householdId, userId, cadence, label: goalPeriodLabel(cadence) },
      include: goalSetInclude,
    })
  );
}

export const goalResolvers = {
  Query: {
    currentGoals: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const [members, sets] = await Promise.all([
        loadHouseholdMembers(context, householdId),
        context.prisma.goalSet.findMany({
          where: { householdId, archivedAt: null },
          include: goalSetInclude,
          orderBy: [{ createdAt: "asc" }],
        }),
      ]);

      return { members, sets: sets.map(serializeGoalSet) };
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
        include: goalSetInclude,
        orderBy: [{ archivedAt: "desc" }, { createdAt: "desc" }],
      });

      const byCadence: Record<GoalCadence, GoalSetWithGoals[]> = {
        DAILY: archived.filter((set) => set.cadence === "DAILY"),
        WEEKLY: archived.filter((set) => set.cadence === "WEEKLY"),
        TERM: archived.filter((set) => set.cadence === "TERM"),
      };
      const page = (cadence: GoalCadence) =>
        byCadence[cadence].slice(offset, offset + limit).map(serializeGoalSet);
      const hasMore = (cadence: GoalCadence) => byCadence[cadence].length > offset + limit;

      const stats = members.map((user) => {
        const userStats = (cadence: GoalCadence) =>
          cadenceStats(
            cadence,
            byCadence[cadence].filter((set) => set.userId === user.id),
          );

        return {
          user,
          daily: userStats("DAILY"),
          weekly: userStats("WEEKLY"),
          term: userStats("TERM"),
        };
      });

      return {
        stats,
        daily: page("DAILY"),
        weekly: page("WEEKLY"),
        term: page("TERM"),
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
      const title = requireText(args.title, "Goal title is required");

      const set = await getOrCreateCurrentSet(context, householdId, userId, args.cadence);
      const limit = GOAL_LIMITS[args.cadence];
      if (set.goals.length >= limit) {
        throw new ForbiddenError(`At most ${limit} ${args.cadence.toLowerCase()} goals allowed`);
      }

      await context.prisma.goal.create({
        data: { setId: set.id, title, sortOrder: set.goals.length },
      });

      const updated = await context.prisma.goalSet.update({
        where: { id: set.id },
        data: { label: goalPeriodLabel(args.cadence) },
        include: goalSetInclude,
      });

      return serializeGoalSet(updated);
    },

    updateGoal: async (
      _parent: unknown,
      args: { id: string; title: string },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const title = requireText(args.title, "Goal title is required");
      await assertOwnCurrentGoal(context, args.id, userId, householdId);

      return serializeGoal(
        await context.prisma.goal.update({ where: { id: args.id }, data: { title } }),
      );
    },

    setGoalCompleted: async (
      _parent: unknown,
      args: { id: string; completed: boolean },
      context: GraphQLContext,
    ) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      await assertOwnCurrentGoal(context, args.id, userId, householdId);

      return serializeGoal(
        await context.prisma.goal.update({
          where: { id: args.id },
          data: { completedAt: args.completed ? new Date() : null },
        }),
      );
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
        where: { householdId, userId, cadence: args.cadence, archivedAt: null },
        include: { goals: { select: { id: true } } },
      });

      if (!current) {
        return true;
      }

      if (current.goals.length === 0) {
        await context.prisma.goalSet.delete({ where: { id: current.id } });
      } else {
        await context.prisma.goalSet.update({
          where: { id: current.id },
          data: { archivedAt: new Date(), label: goalPeriodLabel(args.cadence) },
        });
      }

      return true;
    },
  },

  GoalSet: {
    user: (parent: GoalSetWithGoals, _args: unknown, context: GraphQLContext) =>
      parent.user ?? context.prisma.user.findUniqueOrThrow({ where: { id: parent.userId } }),
  },
};
