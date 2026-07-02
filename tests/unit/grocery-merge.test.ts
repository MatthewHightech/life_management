import { describe, expect, it } from "vitest";
import { mergeGroceryIngredients } from "@life/shared";

describe("mergeGroceryIngredients", () => {
  it("merges same ingredient with the same unit", () => {
    const result = mergeGroceryIngredients([
      { name: "onion", quantity: "1", unit: "cup" },
      { name: "Onion", quantity: "2", unit: "cup" },
    ]);

    expect(result).toEqual([{ name: "onion", quantityLabel: "3 cup" }]);
  });

  it("combines different units into one row with multiple quantity strings", () => {
    const result = mergeGroceryIngredients([
      { name: "flour", quantity: "2", unit: "cups" },
      { name: "flour", quantity: "500", unit: "g" },
    ]);

    expect(result).toEqual([{ name: "flour", quantityLabel: "2 cups · 500 g" }]);
  });
});

describe("getMealPlanWeekStartIso", () => {
  it("returns the Sunday for the reference date in Pacific time", async () => {
    const { getMealPlanWeekStartIso } = await import("@life/shared");
    const weekStart = getMealPlanWeekStartIso(new Date("2025-06-25T12:00:00.000Z"));
    expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
