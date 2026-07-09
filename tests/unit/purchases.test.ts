import { describe, expect, it } from "vitest";
import {
  budgetLineDropId,
  budgetPurchaseDragId,
  getPurchaseBudgetYearMonth,
  parseBudgetLineDropId,
  parseBudgetPurchaseDragId,
  purchaseDateOutsideBudgetMonthNotice,
  purchaseMatchesAnnualBudget,
  purchaseMatchesMonthlyBudget,
} from "../../packages/shared/src/purchases";
import { formatBudgetRemainingLabel } from "../../packages/shared/src/budget";

describe("budget purchases", () => {
  it("builds and parses drag/drop ids", () => {
    expect(budgetPurchaseDragId("p1")).toBe("budget-purchase:p1");
    expect(parseBudgetPurchaseDragId("budget-purchase:p1")).toBe("p1");
    expect(parseBudgetPurchaseDragId("other:p1")).toBeUndefined();

    expect(budgetLineDropId("line1")).toBe("budget-line:line1");
    expect(parseBudgetLineDropId("budget-line:line1")).toBe("line1");
  });

  it("maps purchase dates to budget year/month in PST", () => {
    const julyFirst = new Date("2026-07-01T12:00:00.000Z");
    expect(getPurchaseBudgetYearMonth(julyFirst)).toEqual({ year: 2026, month: 7 });
    expect(purchaseMatchesMonthlyBudget(julyFirst, 2026, 7)).toBe(true);
    expect(purchaseMatchesMonthlyBudget(julyFirst, 2026, 6)).toBe(false);
    expect(purchaseMatchesAnnualBudget(julyFirst, 2026)).toBe(true);
    expect(purchaseMatchesAnnualBudget(julyFirst, 2025)).toBe(false);
  });

  it("formats outside-month notice", () => {
    const junePurchase = new Date("2026-06-15T12:00:00.000Z");
    expect(purchaseDateOutsideBudgetMonthNotice(junePurchase, 2026, 7)).toMatch(/June 2026/);
    expect(purchaseDateOutsideBudgetMonthNotice(junePurchase, 2026, 6)).toBeNull();
  });

  it("formats over-budget remaining label", () => {
    expect(formatBudgetRemainingLabel(10_000, 2_500)).toMatch(/\$75\.00/);
    expect(formatBudgetRemainingLabel(10_000, 12_500)).toMatch(/\$25\.00 over budget/);
  });
});
