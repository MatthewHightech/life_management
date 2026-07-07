import { describe, expect, it } from "vitest";
import {
  ANNUAL_SPEND_MONTH,
  annualCentsFromMonthlyPortion,
  budgetLineMonthlyBudgetCents,
  budgetLineMonthlySpentCents,
  budgetProgressPercent,
  budgetRemainingCents,
  budgetRemainingPercent,
  formatCadCents,
  monthlyPortionOfAnnualCents,
  parseCadInputToCents,
  spendMonthKey,
  storedBudgetAmountCents,
} from "../../packages/shared/src/budget";

describe("budget money", () => {
  it("formats CAD cents", () => {
    expect(formatCadCents(123456)).toMatch(/\$1,234\.56/);
  });

  it("parses CAD input to cents", () => {
    expect(parseCadInputToCents("$12.50")).toBe(1250);
    expect(parseCadInputToCents("12.5")).toBe(1250);
    expect(parseCadInputToCents("")).toBeNull();
    expect(parseCadInputToCents("abc")).toBeNull();
  });

  it("computes progress and remaining", () => {
    expect(budgetProgressPercent(2500, 10000)).toBe(25);
    expect(budgetProgressPercent(15000, 10000)).toBe(100);
    expect(budgetRemainingCents(10000, 2500)).toBe(7500);
    expect(budgetRemainingPercent(2500, 10000)).toBe(75);
    expect(budgetRemainingPercent(0, 10000)).toBe(100);
    expect(budgetRemainingPercent(10000, 10000)).toBe(0);
    expect(budgetRemainingPercent(15000, 10000)).toBe(0);
  });

  it("maps annual spend month key", () => {
    expect(spendMonthKey("MONTHLY", 2026, 7)).toBe(7);
    expect(spendMonthKey("ANNUAL", 2026, 7)).toBe(ANNUAL_SPEND_MONTH);
  });

  it("prorates annual budget and spend to monthly portions", () => {
    expect(monthlyPortionOfAnnualCents(120_000)).toBe(10_000);
    expect(monthlyPortionOfAnnualCents(1_201)).toBe(100);
    expect(budgetLineMonthlyBudgetCents(120_000, "ANNUAL")).toBe(10_000);
    expect(budgetLineMonthlyBudgetCents(5_000, "MONTHLY")).toBe(5_000);
    expect(budgetLineMonthlySpentCents(60_000, "ANNUAL")).toBe(5_000);
    expect(budgetLineMonthlySpentCents(2_500, "MONTHLY")).toBe(2_500);
    expect(annualCentsFromMonthlyPortion(10_000)).toBe(120_000);
    expect(storedBudgetAmountCents(10_000, "ANNUAL")).toBe(120_000);
    expect(storedBudgetAmountCents(5_000, "MONTHLY")).toBe(5_000);
  });
});
