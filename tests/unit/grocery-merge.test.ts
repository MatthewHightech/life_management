import { describe, expect, it } from "vitest";
import {
  mergeGroceryIngredients,
  scaleGroceryIngredients,
  scaleQuantityString,
  scaleServings,
} from "@life/shared";

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

  it("scales recipe ingredients before merging into the grocery list", () => {
    const result = mergeGroceryIngredients(
      scaleGroceryIngredients(
        [
          { name: "onion", quantity: "1", unit: "cup" },
          { name: "flour", quantity: "1/2", unit: "cup" },
        ],
        2,
      ),
    );

    expect(result).toEqual([
      { name: "flour", quantityLabel: "1 cup" },
      { name: "onion", quantityLabel: "2 cup" },
    ]);
  });
});

describe("scaleQuantityString", () => {
  it("scales decimal and fraction quantities", () => {
    expect(scaleQuantityString("1.5", 2)).toBe("3");
    expect(scaleQuantityString("1/2", 3)).toBe("1.5");
    expect(scaleQuantityString("1 1/2", 0.5)).toBe("0.75");
    expect(scaleQuantityString("to taste", 2)).toBe("to taste");
  });
});

describe("scaleServings", () => {
  it("scales base servings without mutating the source value", () => {
    expect(scaleServings(4, 1.5)).toBe(6);
    expect(scaleServings(3, 0.5)).toBe(1.5);
    expect(scaleServings(null, 2)).toBeNull();
  });
});

describe("getMealPlanWeekStartIso", () => {
  it("returns the Sunday for the reference date in Pacific time", async () => {
    const { getMealPlanWeekStartIso } = await import("@life/shared");
    const weekStart = getMealPlanWeekStartIso(new Date("2025-06-25T12:00:00.000Z"));
    expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
