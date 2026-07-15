import type { ImportedRecipeIngredient } from "./types";

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

/** Word units get Title case; abbreviations stay lowercase. */
const UNIT_ALIASES: Record<string, string> = {
  cup: "Cup",
  cups: "Cups",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tsp: "tsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbsp: "tbsp",
  tbs: "tbsp",
  ounce: "oz",
  ounces: "oz",
  oz: "oz",
  pound: "lb",
  pounds: "lb",
  lb: "lb",
  lbs: "lb",
  gram: "g",
  grams: "g",
  g: "g",
  kilogram: "kg",
  kilograms: "kg",
  kg: "kg",
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  millilitres: "ml",
  ml: "ml",
  liter: "L",
  liters: "L",
  litre: "L",
  litres: "L",
  l: "L",
  pinch: "Pinch",
  pinches: "Pinches",
  clove: "Clove",
  cloves: "Cloves",
  can: "Can",
  cans: "Cans",
  package: "Package",
  packages: "Packages",
  pkg: "Package",
  pkgs: "Packages",
  slice: "Slice",
  slices: "Slices",
  piece: "Piece",
  pieces: "Pieces",
  bunch: "Bunch",
  bunches: "Bunches",
  stick: "Stick",
  sticks: "Sticks",
  dash: "Dash",
  dashes: "Dashes",
  handful: "Handful",
  handfuls: "Handfuls",
  quart: "Quart",
  quarts: "Quarts",
  qt: "Quart",
  pint: "Pint",
  pints: "Pints",
  pt: "Pint",
  gallon: "Gallon",
  gallons: "Gallons",
  gal: "Gallon",
};

const FRACTION_ONLY = /^(\d+)\s*\/\s*(\d+)$/;
const DECIMAL_OR_INT = /^\d+(?:\.\d+)?$/;
const UNICODE_ONLY = new RegExp(`^[${Object.keys(UNICODE_FRACTIONS).join("")}]$`);
const MIXED_UNICODE = new RegExp(`^(\\d+)([${Object.keys(UNICODE_FRACTIONS).join("")}])$`);

function formatQuantity(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }
  return String(rounded);
}

function titleCaseName(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => {
      if (!word) {
        return word;
      }
      // Keep short all-caps tokens (e.g. BBQ) as-is.
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function parseQuantityToken(token: string): number | null {
  const unicode = UNICODE_FRACTIONS[token];
  if (unicode != null) {
    return unicode;
  }

  const mixedUnicode = token.match(MIXED_UNICODE);
  if (mixedUnicode) {
    return Number(mixedUnicode[1]) + UNICODE_FRACTIONS[mixedUnicode[2]];
  }

  const fraction = token.match(FRACTION_ONLY);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) {
      return null;
    }
    return Number(fraction[1]) / denominator;
  }

  if (DECIMAL_OR_INT.test(token)) {
    return Number(token);
  }

  return null;
}

function isFractionToken(token: string): boolean {
  return FRACTION_ONLY.test(token) || UNICODE_ONLY.test(token);
}

/**
 * Split a recipe-ingredient line into name / quantity / unit.
 * Examples:
 * - "1 cup granulated sugar" → Granulated Sugar, 1, Cup
 * - "1/2 Cups milk" → Milk, 0.5, Cups
 * - "1/4 tsp salt" → Salt, 0.25, tsp
 * - "2 eggs" → Eggs, 2, (no unit)
 * - "salt to taste" → Salt To Taste (no qty/unit)
 */
export function parseIngredientLine(line: string): ImportedRecipeIngredient {
  const cleaned = line.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return { name: "", quantity: null, unit: null };
  }

  const tokens = cleaned.split(" ");
  let index = 0;
  let quantity: number | null = null;

  const first = parseQuantityToken(tokens[0] ?? "");
  if (first != null) {
    quantity = first;
    index = 1;
    // Mixed fraction: "1 1/2"
    if (index < tokens.length && isFractionToken(tokens[index])) {
      const fraction = parseQuantityToken(tokens[index]);
      if (fraction != null) {
        quantity += fraction;
        index += 1;
      }
    }
  }

  let unit: string | null = null;
  if (quantity != null && index < tokens.length) {
    const candidate = tokens[index].toLowerCase().replace(/\.$/, "");
    const normalized = UNIT_ALIASES[candidate];
    if (normalized) {
      unit = normalized;
      index += 1;
    }
  }

  const namePart = tokens.slice(index).join(" ").trim();
  if (!namePart) {
    // e.g. "2 cups" with nothing after — keep original as name.
    return {
      name: titleCaseName(cleaned),
      quantity: null,
      unit: null,
    };
  }

  return {
    name: titleCaseName(namePart),
    quantity: quantity != null ? formatQuantity(quantity) : null,
    unit,
  };
}
