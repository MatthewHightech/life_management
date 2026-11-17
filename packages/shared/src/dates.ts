import {
  addDays,
  addMonths,
  addWeeks,
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
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

export function dayBounds(date: Date = new Date()) {
  return { start: startOfDay(date), end: endOfDay(date) };
}

/**
 * Until per-household TZ exists, "today" for date-only dues uses Pacific
 * (same convention as budget / meal plan).
 */
const DUE_DATE_TIMEZONE = "America/Los_Angeles";

function calendarDayKeyInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Due dates are date-only. We persist UTC noon on the picked calendar day
 * (and historically local midnights like 07:00Z/08:00Z). The intended day is
 * always the UTC calendar date of that timestamp.
 */
export function dueCalendarDayKey(dueDate: Date): string {
  return dueDate.toISOString().slice(0, 10);
}

/** Persist a date-only due date as UTC noon on the picker's local calendar day. */
export function toDueDateIso(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
  ).toISOString();
}

/** Local midnight for the due calendar day — for pickers and display. */
export function parseDueDate(value: string): Date {
  const date = parseISO(value);
  if (!isValid(date)) {
    throw new Error("Invalid date value");
  }
  const [year, month, day] = dueCalendarDayKey(date).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDueDate(value: Date | string): string {
  const date = typeof value === "string" ? parseDueDate(value) : parseDueDate(value.toISOString());
  return format(date, "MMM d");
}

/** True only after the due calendar day has ended (from 12:00am the next day). */
export function isPastDueDate(dueDate: Date, now: Date = new Date()): boolean {
  return calendarDayKeyInTimeZone(now, DUE_DATE_TIMEZONE) > dueCalendarDayKey(dueDate);
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
  const date = typeof value === "string" ? parseDisplayDate(value) : value;
  return format(date, "MMM d");
}

export function formatLongDate(value: Date | string): string {
  const date = typeof value === "string" ? parseDisplayDate(value) : value;
  return format(date, "MMMM d, yyyy");
}

export function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    throw new Error("Invalid date value");
  }
  return format(date, "MMM d, h:mm a");
}

export function formatCalendarGroupLabel(value: Date | string): string {
  const date = typeof value === "string" ? parseDisplayDate(value) : value;
  return format(date, "EEE, MMM d");
}

export function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  try {
    return format(parseDisplayDate(value), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export function buildMonthGrid(month: Date, weekStartsOn: 0 | 1 = 0): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn }),
  });
}

export function buildWeekDays(day: Date, weekStartsOn: 0 | 1 = 0): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(day, { weekStartsOn }),
    end: endOfWeek(day, { weekStartsOn }),
  });
}

export function formatMonthYear(value: Date): string {
  return format(value, "MMMM yyyy");
}

export function formatWeekRange(day: Date, weekStartsOn: 0 | 1 = 0): string {
  const start = startOfWeek(day, { weekStartsOn });
  const end = endOfWeek(day, { weekStartsOn });

  if (start.getFullYear() !== end.getFullYear()) {
    return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
  }

  if (start.getMonth() !== end.getMonth()) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  }

  return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
}

export function calendarDayKey(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

function parseDisplayDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = parseISO(value);
  if (!isValid(date)) {
    throw new Error("Invalid date value");
  }

  return date;
}

export {
  addDays,
  addMonths,
  addWeeks,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
};
