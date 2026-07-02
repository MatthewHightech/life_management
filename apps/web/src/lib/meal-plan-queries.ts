import { MEAL_PLAN_QUERY } from "@/graphql/operations/meals";

export const MEAL_PLAN_REFETCH = [{ query: MEAL_PLAN_QUERY }] as const;
