import { format, subMonths } from "date-fns";
import { getBudgetCalendarPeriod } from "./budget";

function budgetMonthFromParts(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
}

export function formatBudgetReportTitle(year: number, month: number): string {
  return format(budgetMonthFromParts(year, month), "MMMM yyyy");
}

export function formatBudgetReportEmptyMessage(year: number, month: number): string {
  return `No report for ${formatBudgetReportTitle(year, month)}`;
}

export function previousBudgetYearMonth(year: number, month: number) {
  const previous = subMonths(budgetMonthFromParts(year, month), 1);
  return {
    year: previous.getUTCFullYear(),
    month: previous.getUTCMonth() + 1,
  };
}

export function isBudgetMonthInFuture(year: number, month: number, reference = new Date()): boolean {
  const current = getBudgetCalendarPeriod(reference);
  return year !== current.year ? year > current.year : month > current.month;
}

export type SpendComparison = {
  deltaCents: number;
  deltaPercent: number;
};

export function spendComparison(currentCents: number, previousCents: number): SpendComparison | null {
  if (previousCents <= 0) {
    return null;
  }

  return {
    deltaCents: currentCents - previousCents,
    deltaPercent: Math.round(((currentCents - previousCents) / previousCents) * 100),
  };
}
