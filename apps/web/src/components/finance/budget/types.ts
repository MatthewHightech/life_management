import type { BudgetLineType, BudgetMonthQuery, BudgetPurchaseAllocation } from "@/graphql";

export type BudgetScope = BudgetLineType;
export type BudgetMonth = BudgetMonthQuery["budgetMonth"];
export type BudgetSection = BudgetMonth["monthlySections"][number];
export type BudgetLineItem = BudgetSection["lineItems"][number];
export type BudgetPurchase = BudgetMonth["purchases"][number];
export type { BudgetPurchaseAllocation };
