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

export type WeekDay = (typeof WEEK_DAYS)[number];
export type MealSlot = (typeof MEAL_SLOTS)[number];

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

import type { FolderColor } from "./folders";

export type RecipeFolderColor = FolderColor;
