import { prisma } from "@life/db";
import { getMealPlanWeekStartIso } from "@life/shared";
import { cleanupMealPlanWeeksBefore } from "@life/graphql/meals/rollover";

export async function runMealPlanWeekRollover() {
  const weekStartIso = getMealPlanWeekStartIso();
  await cleanupMealPlanWeeksBefore({ prisma, user: null }, weekStartIso);
  console.log(`[meal-plan] Rolled over meal plans before ${weekStartIso}`);
}
