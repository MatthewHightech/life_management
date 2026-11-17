import { WEEK_DAYS, MEAL_SLOTS, type MealSlot, type WeekDay } from "@life/shared";

/** Canonical backend slot used for the single-meal-per-day UI. */
export const DAY_MEAL_SLOT: MealSlot = "DINNER";

export const weekDayLabels: Record<WeekDay, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

export const weekDayFullLabels: Record<WeekDay, string> = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

export const mealSlotLabels: Record<(typeof MEAL_SLOTS)[number], string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

export const WEEK_DAY_ORDER = WEEK_DAYS;
