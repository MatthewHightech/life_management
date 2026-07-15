import type { ImportedRecipeDraft, ImportedRecipeIngredient } from "./types";
import { RecipeImportError } from "./types";
import { parseIngredientLine } from "./ingredient";

const LD_JSON_SCRIPT =
  /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function typeIncludesRecipe(typeValue: unknown): boolean {
  if (typeValue === "Recipe") {
    return true;
  }
  if (Array.isArray(typeValue)) {
    return typeValue.includes("Recipe");
  }
  return false;
}

function findRecipeNode(value: unknown): Record<string, unknown> | null {
  if (value == null) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRecipeNode(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  const record = asRecord(value);
  if (!record) {
    return null;
  }

  if (typeIncludesRecipe(record["@type"])) {
    return record;
  }

  return (
    findRecipeNode(record["@graph"]) ??
    findRecipeNode(record.mainEntity) ??
    findRecipeNode(record.mainEntityOfPage)
  );
}

function textFromNode(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  const record = asRecord(value);
  if (!record) {
    return "";
  }
  if (typeof record.text === "string") {
    return record.text.trim();
  }
  if (typeof record.name === "string") {
    return record.name.trim();
  }
  return "";
}

function normalizeInstructions(raw: unknown): string | null {
  if (raw == null) {
    return null;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed || null;
  }

  if (Array.isArray(raw)) {
    const lines = raw
      .flatMap((step, index) => {
        const record = asRecord(step);
        if (record?.itemListElement) {
          const nested = normalizeInstructions(record.itemListElement);
          return nested ? [nested] : [];
        }
        const text = textFromNode(step);
        if (!text) {
          return [];
        }
        return [`${index + 1}. ${text}`];
      })
      .filter(Boolean);
    return lines.length > 0 ? lines.join("\n") : null;
  }

  const record = asRecord(raw);
  if (record?.itemListElement) {
    return normalizeInstructions(record.itemListElement);
  }

  const text = textFromNode(raw);
  return text || null;
}

function normalizeIngredients(raw: unknown): ImportedRecipeIngredient[] {
  if (raw == null) {
    return [];
  }

  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((item) => textFromNode(item))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((line) => parseIngredientLine(line))
    .filter((ingredient) => ingredient.name);
}

function normalizeServings(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.round(raw);
  }

  if (typeof raw === "string") {
    const match = raw.match(/(\d+(?:\.\d+)?)/);
    if (!match) {
      return null;
    }
    const value = Number(match[1]);
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  if (Array.isArray(raw) && raw.length > 0) {
    return normalizeServings(raw[0]);
  }

  return null;
}

function extractLdJsonBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  for (const match of html.matchAll(LD_JSON_SCRIPT)) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Some sites emit trailing commas or HTML comments; skip bad blocks.
    }
  }
  return blocks;
}

/** Parse Schema.org Recipe JSON-LD from an HTML document. */
export function parseRecipeHtml(html: string, sourceUrl: string): ImportedRecipeDraft {
  const blocks = extractLdJsonBlocks(html);
  let recipe: Record<string, unknown> | null = null;
  for (const block of blocks) {
    recipe = findRecipeNode(block);
    if (recipe) {
      break;
    }
  }

  if (!recipe) {
    throw new RecipeImportError(
      "No structured recipe data found on that page. Try another site, or add the recipe manually.",
    );
  }

  const name = textFromNode(recipe.name);
  const ingredients = normalizeIngredients(recipe.recipeIngredient ?? recipe.ingredients);
  const instructions = normalizeInstructions(recipe.recipeInstructions);
  const servings = normalizeServings(recipe.recipeYield ?? recipe.yield);

  if (!name) {
    throw new RecipeImportError("The recipe on that page is missing a name.");
  }
  if (ingredients.length === 0) {
    throw new RecipeImportError("The recipe on that page has no ingredients.");
  }

  return {
    name,
    instructions,
    servings,
    ingredients,
    sourceUrl,
  };
}
