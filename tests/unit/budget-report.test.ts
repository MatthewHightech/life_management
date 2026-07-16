import { describe, expect, it } from "vitest";
import {
  formatBudgetReportEmptyMessage,
  formatBudgetReportTitle,
  isBudgetMonthInFuture,
  previousBudgetYearMonth,
  spendComparison,
} from "@life/shared";

describe("budget-report helpers", () => {
  it("formats report titles", () => {
    expect(formatBudgetReportTitle(2026, 7)).toBe("July 2026");
    expect(formatBudgetReportEmptyMessage(2026, 3)).toBe("No report for March 2026");
  });

  it("steps to previous budget month", () => {
    expect(previousBudgetYearMonth(2026, 7)).toEqual({ year: 2026, month: 6 });
    expect(previousBudgetYearMonth(2026, 1)).toEqual({ year: 2025, month: 12 });
  });

  it("detects future months in PST", () => {
    const reference = new Date("2026-07-15T12:00:00.000Z");
    expect(isBudgetMonthInFuture(2026, 8, reference)).toBe(true);
    expect(isBudgetMonthInFuture(2026, 7, reference)).toBe(false);
    expect(isBudgetMonthInFuture(2026, 6, reference)).toBe(false);
  });

  it("computes spend comparison only when previous spend is positive", () => {
    expect(spendComparison(12000, 10000)).toEqual({ deltaCents: 2000, deltaPercent: 20 });
    expect(spendComparison(8000, 10000)).toEqual({ deltaCents: -2000, deltaPercent: -20 });
    expect(spendComparison(1000, 0)).toBeNull();
  });
});
