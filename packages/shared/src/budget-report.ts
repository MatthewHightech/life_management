import { format, subMonths } from "date-fns";
import { getBudgetCalendarPeriod } from "./budget";

export type BudgetYearMonth = {
  year: number;
  month: number;
};

export function budgetMonthFromParts(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
}

export function formatBudgetReportTitle(year: number, month: number): string {
  return format(budgetMonthFromParts(year, month), "MMMM yyyy");
}

export function formatBudgetReportEmptyMessage(year: number, month: number): string {
  return `No report for ${formatBudgetReportTitle(year, month)}`;
}

export function previousBudgetYearMonth(year: number, month: number): BudgetYearMonth {
  const previous = subMonths(budgetMonthFromParts(year, month), 1);
  return {
    year: previous.getUTCFullYear(),
    month: previous.getUTCMonth() + 1,
  };
}

export function compareBudgetYearMonth(
  a: BudgetYearMonth,
  b: BudgetYearMonth,
): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  return a.month - b.month;
}

export function isBudgetMonthInFuture(
  year: number,
  month: number,
  reference = new Date(),
): boolean {
  const current = getBudgetCalendarPeriod(reference);
  return compareBudgetYearMonth({ year, month }, current) > 0;
}

export function spendDeltaPercent(currentCents: number, previousCents: number): number | null {
  if (previousCents <= 0) {
    return null;
  }

  return Math.round(((currentCents - previousCents) / previousCents) * 100);
}

export type SpendComparison = {
  deltaCents: number;
  deltaPercent: number;
};

export function spendComparison(
  currentCents: number,
  previousCents: number,
): SpendComparison | null {
  if (previousCents <= 0) {
    return null;
  }

  const deltaPercent = spendDeltaPercent(currentCents, previousCents);
  if (deltaPercent === null) {
    return null;
  }

  return {
    deltaCents: currentCents - previousCents,
    deltaPercent,
  };
}
