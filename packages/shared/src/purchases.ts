import { BUDGET_TIMEZONE, getPurchaseBudgetYearMonth } from "./budget";

const BUDGET_PURCHASE_DRAG_PREFIX = "budget-purchase:";
const BUDGET_LINE_DROP_PREFIX = "budget-line:";

function parsePrefixedId(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) || undefined : undefined;
}

export function budgetPurchaseDragId(purchaseId: string) {
  return `${BUDGET_PURCHASE_DRAG_PREFIX}${purchaseId}`;
}

export function budgetLineDropId(lineItemId: string) {
  return `${BUDGET_LINE_DROP_PREFIX}${lineItemId}`;
}

export function parseBudgetPurchaseDragId(value: string) {
  return parsePrefixedId(value, BUDGET_PURCHASE_DRAG_PREFIX);
}

export function parseBudgetLineDropId(value: string) {
  return parsePrefixedId(value, BUDGET_LINE_DROP_PREFIX);
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

export function purchaseMatchesBudgetLine(
  lineType: "MONTHLY" | "ANNUAL",
  purchaseDate: Date,
  budgetYear: number,
  budgetMonth: number,
) {
  return lineType === "MONTHLY"
    ? purchaseMatchesMonthlyBudget(purchaseDate, budgetYear, budgetMonth)
    : purchaseMatchesAnnualBudget(purchaseDate, budgetYear);
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
