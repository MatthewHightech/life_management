import type { BudgetMonthQuery } from "@/graphql";

export type BudgetMonth = BudgetMonthQuery["budgetMonth"];
export type BudgetSection = BudgetMonth["monthlySections"][number];
export type BudgetLineItem = BudgetSection["lineItems"][number];
