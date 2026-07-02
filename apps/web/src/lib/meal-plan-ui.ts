import { WEEK_DAYS, MEAL_SLOTS } from "@life/shared";

export const weekDayLabels: Record<(typeof WEEK_DAYS)[number], string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

export const mealSlotLabels: Record<(typeof MEAL_SLOTS)[number], string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};
