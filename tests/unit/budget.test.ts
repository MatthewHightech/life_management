import { describe, expect, it } from "vitest";
import {
  budgetRemainingCents,
  budgetRemainingPercent,
  formatCadCents,
  parseCadInputToCents,
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
    expect(budgetRemainingCents(10000, 2500)).toBe(7500);
    expect(budgetRemainingPercent(2500, 10000)).toBe(75);
    expect(budgetRemainingPercent(0, 10000)).toBe(100);
    expect(budgetRemainingPercent(10000, 10000)).toBe(0);
    expect(budgetRemainingPercent(15000, 10000)).toBe(0);
  });
});
