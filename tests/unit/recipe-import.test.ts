import { describe, expect, it } from "vitest";
import {
  parseRecipeHtml,
  parseIngredientLine,
  assertSafeRecipeUrl,
  RecipeImportError,
} from "../../packages/recipe-import/src";

const SAMPLE_HTML = `<!doctype html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": "Test Pancakes",
    "recipeYield": "4 servings",
    "recipeIngredient": [
      "2 cups flour",
      "2 eggs",
      "1 cup milk"
    ],
    "recipeInstructions": [
      { "@type": "HowToStep", "text": "Mix dry ingredients." },
      { "@type": "HowToStep", "text": "Add wet ingredients and cook." }
    ]
  }
  </script>
</head>
<body></body>
</html>`;

const GRAPH_HTML = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "name": "Page" },
    {
      "@type": "Recipe",
      "name": "Graph Soup",
      "recipeIngredient": ["1 onion", "2 cups broth"],
      "recipeInstructions": "Simmer until soft."
    }
  ]
}
</script>`;

describe("parseIngredientLine", () => {
  it("splits quantity, unit, and name", () => {
    expect(parseIngredientLine("1 cup granulated sugar")).toEqual({
      name: "Granulated Sugar",
      quantity: "1",
      unit: "Cup",
    });
  });

  it("converts fractions to decimals", () => {
    expect(parseIngredientLine("1/2 Cups milk")).toEqual({
      name: "Milk",
      quantity: "0.5",
      unit: "Cups",
    });
    expect(parseIngredientLine("1/4 tsp salt")).toEqual({
      name: "Salt",
      quantity: "0.25",
      unit: "tsp",
    });
  });

  it("handles mixed fractions and quantity-only lines", () => {
    expect(parseIngredientLine("1 1/2 cups flour")).toEqual({
      name: "Flour",
      quantity: "1.5",
      unit: "Cups",
    });
    expect(parseIngredientLine("2 eggs")).toEqual({
      name: "Eggs",
      quantity: "2",
      unit: null,
    });
  });

  it("keeps lines without a leading quantity as the name", () => {
    expect(parseIngredientLine("salt to taste")).toEqual({
      name: "Salt To Taste",
      quantity: null,
      unit: null,
    });
  });
});

describe("recipe import parse", () => {
  it("parses a Schema.org Recipe from JSON-LD", () => {
    const draft = parseRecipeHtml(SAMPLE_HTML, "https://example.com/pancakes");
    expect(draft.name).toBe("Test Pancakes");
    expect(draft.servings).toBe(4);
    expect(draft.ingredients).toEqual([
      { name: "Flour", quantity: "2", unit: "Cups" },
      { name: "Eggs", quantity: "2", unit: null },
      { name: "Milk", quantity: "1", unit: "Cup" },
    ]);
    expect(draft.instructions).toContain("Mix dry ingredients.");
    expect(draft.instructions).toContain("Add wet ingredients and cook.");
    expect(draft.sourceUrl).toBe("https://example.com/pancakes");
  });

  it("finds Recipe nodes inside @graph", () => {
    const draft = parseRecipeHtml(GRAPH_HTML, "https://example.com/soup");
    expect(draft.name).toBe("Graph Soup");
    expect(draft.ingredients).toEqual([
      { name: "Onion", quantity: "1", unit: null },
      { name: "Broth", quantity: "2", unit: "Cups" },
    ]);
    expect(draft.instructions).toBe("Simmer until soft.");
  });

  it("rejects pages without recipe structured data", () => {
    expect(() => parseRecipeHtml("<html><body>No recipe</body></html>", "https://example.com")).toThrow(
      RecipeImportError,
    );
  });
});

describe("recipe import url safety", () => {
  it("allows public https URLs", () => {
    expect(assertSafeRecipeUrl("https://www.allrecipes.com/recipe/123").hostname).toBe(
      "www.allrecipes.com",
    );
  });

  it("blocks localhost and private hosts", () => {
    expect(() => assertSafeRecipeUrl("http://localhost/recipe")).toThrow(RecipeImportError);
    expect(() => assertSafeRecipeUrl("http://127.0.0.1/recipe")).toThrow(RecipeImportError);
    expect(() => assertSafeRecipeUrl("http://192.168.1.10/recipe")).toThrow(RecipeImportError);
  });
});
