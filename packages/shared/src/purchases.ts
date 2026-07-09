import { BUDGET_TIMEZONE } from "./budget";

export const BUDGET_PURCHASE_DRAG_PREFIX = "budget-purchase";
export const BUDGET_LINE_DROP_PREFIX = "budget-line";

export function budgetPurchaseDragId(purchaseId: string) {
  return `${BUDGET_PURCHASE_DRAG_PREFIX}:${purchaseId}`;
}

export function budgetLineDropId(lineItemId: string) {
  return `${BUDGET_LINE_DROP_PREFIX}:${lineItemId}`;
}

export function parseBudgetPurchaseDragId(value: string) {
  if (!value.startsWith(`${BUDGET_PURCHASE_DRAG_PREFIX}:`)) {
    return undefined;
  }
  const id = value.slice(BUDGET_PURCHASE_DRAG_PREFIX.length + 1);
  return id || undefined;
}

export function parseBudgetLineDropId(value: string) {
  if (!value.startsWith(`${BUDGET_LINE_DROP_PREFIX}:`)) {
    return undefined;
  }
  const id = value.slice(BUDGET_LINE_DROP_PREFIX.length + 1);
  return id || undefined;
}

export function getPurchaseBudgetYearMonth(reference: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BUDGET_TIMEZONE,
    year: "numeric",
    month: "numeric",
  });

  const parts = formatter.formatToParts(reference);
  const lookup = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
  };
}

export function purchaseMatchesMonthlyBudget(
  purchaseDate: Date,
  budgetYear: number,
  budgetMonth: number,
) {
  const { year, month } = getPurchaseBudgetYearMonth(purchaseDate);
  return year === budgetYear && month === budgetMonth;
}

export function purchaseMatchesAnnualBudget(purchaseDate: Date, budgetYear: number) {
  return getPurchaseBudgetYearMonth(purchaseDate).year === budgetYear;
}

export function purchaseDateOutsideBudgetMonthNotice(
  purchaseDate: Date,
  budgetYear: number,
  budgetMonth: number,
) {
  if (purchaseMatchesMonthlyBudget(purchaseDate, budgetYear, budgetMonth)) {
    return null;
  }

  const label = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUDGET_TIMEZONE,
    month: "long",
    year: "numeric",
  }).format(purchaseDate);

  return `This purchase is dated ${label} and was saved to that month’s inbox.`;
}
