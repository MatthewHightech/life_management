import { endOfDay, format, isValid, parseISO, startOfDay } from "date-fns";

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
