import { parseMealPlanWeekStart } from "@life/shared";
import { GraphQLContext } from "../context";

export async function cleanupMealPlanWeeksBefore(context: GraphQLContext, weekStartIso: string) {
  const weekStart = parseMealPlanWeekStart(weekStartIso);

  await context.prisma.mealPlanSlot.deleteMany({
    where: {
      weekStart: { lt: weekStart },
    },
  });

  await context.prisma.groceryListItem.deleteMany({
    where: {
      weekStart: { lt: weekStart },
    },
  });
}
