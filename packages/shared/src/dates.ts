import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

export function dayBounds(date: Date = new Date()) {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = parseISO(value);
  if (!isValid(date)) {
    throw new Error("Invalid date value");
  }

  return date;
}

export function toIsoString(value: Date | null | undefined): string | null {
  return value?.toISOString() ?? null;
}

export function formatShortDate(value: Date | string): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "MMM d");
}

export function formatCalendarGroupLabel(value: Date | string): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "EEE, MMM d");
}

export function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = parseISO(value);
  if (!isValid(date)) {
    return "";
  }

  return format(date, "yyyy-MM-dd");
}

export function buildMonthGrid(month: Date, weekStartsOn: 0 | 1 = 0): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn }),
  });
}

export function formatMonthYear(value: Date): string {
  return format(value, "MMMM yyyy");
}

export function calendarDayKey(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

export { addMonths, isSameDay, isSameMonth, startOfDay, subMonths };
