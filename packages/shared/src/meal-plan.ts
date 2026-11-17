export const MEAL_PLAN_TIMEZONE = "America/Los_Angeles";

export const WEEK_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export const MEAL_SLOTS = ["BREAKFAST", "LUNCH", "DINNER"] as const;

export const RECIPE_MULTIPLIERS = [0.5, 1, 1.5, 2, 3] as const;
export const DEFAULT_RECIPE_MULTIPLIER = 1 as const;

export type WeekDay = (typeof WEEK_DAYS)[number];
export type MealSlot = (typeof MEAL_SLOTS)[number];
export type RecipeMultiplier = (typeof RECIPE_MULTIPLIERS)[number];

export type GroceryIngredientInput = {
  name: string;
  quantity?: string | null;
  unit?: string | null;
};

export type MergedGroceryLine = {
  name: string;
  quantityLabel: string;
};

function getLosAngelesDateParts(reference: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: MEAL_PLAN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const parts = formatter.formatToParts(reference);
  const lookup = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    dayOfWeek: weekdayMap[lookup.weekday ?? "Sun"] ?? 0,
  };
}

export function getMealPlanWeekStartIso(reference = new Date()): string {
  const { year, month, day, dayOfWeek } = getLosAngelesDateParts(reference);
  const sunday = new Date(Date.UTC(year, month - 1, day - dayOfWeek));
  return sunday.toISOString().slice(0, 10);
}

export function parseMealPlanWeekStart(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatQuantity(quantity?: string | null, unit?: string | null): string | null {
  const qty = quantity?.trim();
  const unitLabel = unit?.trim();

  if (qty && unitLabel) {
    return `${qty} ${unitLabel}`;
  }

  if (qty) {
    return qty;
  }

  if (unitLabel) {
    return unitLabel;
  }

  return null;
}

function parseNumericQuantity(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function roundQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function isRecipeMultiplier(value: number): value is RecipeMultiplier {
  return (RECIPE_MULTIPLIERS as readonly number[]).includes(value);
}

export function normalizeRecipeMultiplier(value: number | null | undefined): RecipeMultiplier {
  if (value == null) {
    return DEFAULT_RECIPE_MULTIPLIER;
  }
  if (!isRecipeMultiplier(value)) {
    throw new Error("Recipe multiplier must be 0.5, 1, 1.5, 2, or 3");
  }
  return value;
}

export function formatRecipeMultiplierLabel(multiplier: number): string {
  return `${multiplier}x`;
}

export function scaleServings(
  servings: number | null | undefined,
  multiplier: number,
): number | null {
  if (servings == null) {
    return null;
  }
  return roundQuantity(servings * multiplier);
}

export function parseQuantityValue(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const mixed = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  }

  const fraction = trimmed.match(/^(-?\d+)\/(\d+)$/);
  if (fraction) {
    return Number(fraction[1]) / Number(fraction[2]);
  }

  const exact = Number(trimmed);
  if (Number.isFinite(exact)) {
    return exact;
  }

  return parseNumericQuantity(trimmed);
}

export function scaleQuantityString(
  quantity: string | null | undefined,
  multiplier: number,
): string | null {
  if (quantity == null) {
    return null;
  }

  const trimmed = quantity.trim();
  if (!trimmed) {
    return null;
  }

  if (multiplier === 1) {
    return trimmed;
  }

  const numeric = parseQuantityValue(trimmed);
  if (numeric === null) {
    return trimmed;
  }

  return String(roundQuantity(numeric * multiplier));
}

export function scaleGroceryIngredients(
  ingredients: GroceryIngredientInput[],
  multiplier: number,
): GroceryIngredientInput[] {
  if (multiplier === 1) {
    return ingredients;
  }

  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: scaleQuantityString(ingredient.quantity, multiplier),
  }));
}

export function mergeGroceryIngredients(ingredients: GroceryIngredientInput[]): MergedGroceryLine[] {
  const grouped = new Map<
    string,
    {
      name: string;
      unitTotals: Map<string, number>;
      looseQuantities: string[];
    }
  >();

  for (const ingredient of ingredients) {
    const name = ingredient.name.trim();
    if (!name) {
      continue;
    }

    const key = name.toLowerCase();
    const entry = grouped.get(key) ?? { name, unitTotals: new Map<string, number>(), looseQuantities: [] as string[] };
    const quantityLabel = formatQuantity(ingredient.quantity, ingredient.unit);

    if (!quantityLabel) {
      grouped.set(key, entry);
      continue;
    }

    const unit = ingredient.unit?.trim() || "";
    const numeric = ingredient.quantity ? parseNumericQuantity(ingredient.quantity) : null;

    if (unit && numeric !== null) {
      entry.unitTotals.set(unit, (entry.unitTotals.get(unit) ?? 0) + numeric);
    } else {
      entry.looseQuantities.push(quantityLabel);
    }

    grouped.set(key, entry);
  }

  return [...grouped.values()]
    .map((entry) => {
      const quantityParts = [
        ...[...entry.unitTotals.entries()].map(([unit, total]) => `${total} ${unit}`.trim()),
        ...entry.looseQuantities,
      ];

      return {
        name: entry.name,
        quantityLabel: quantityParts.length > 0 ? quantityParts.join(" · ") : "",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function mealPlanSlotKey(day: WeekDay, slot: MealSlot): string {
  return `${day}_${slot}`;
}

export function parseMealPlanSlotKey(value: string): { day: WeekDay; slot: MealSlot } | null {
  const [day, slot] = value.split("_");
  if (!(WEEK_DAYS as readonly string[]).includes(day) || !(MEAL_SLOTS as readonly string[]).includes(slot)) {
    return null;
  }

  return { day: day as WeekDay, slot: slot as MealSlot };
}
