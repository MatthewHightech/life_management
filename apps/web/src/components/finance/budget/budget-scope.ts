import type { BudgetMonth } from "@/components/finance/budget/types";
import type { BudgetLineType } from "@/graphql";

export type BudgetScope = BudgetLineType;

export type BudgetTableConfig = {
  scope: BudgetScope;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  emptyMessage: string;
};

export const BUDGET_TABLE_CONFIGS: BudgetTableConfig[] = [
  {
    scope: "MONTHLY",
    emptyMessage: "Add a section to start building your monthly budget.",
  },
  {
    scope: "ANNUAL",
    collapsible: true,
    defaultCollapsed: true,
    emptyMessage: "Add a section to track annual budget items.",
  },
];

export function budgetSectionsForScope(budgetMonth: BudgetMonth, scope: BudgetScope) {
  return scope === "MONTHLY" ? budgetMonth.monthlySections : budgetMonth.annualSections;
}

export function budgetTitleForScope(budgetMonth: BudgetMonth, scope: BudgetScope) {
  return scope === "MONTHLY" ? budgetMonth.title : budgetMonth.annualTitle;
}
