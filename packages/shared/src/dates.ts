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

const DUE_DATE_TIMEZONE = "America/Los_Angeles";

function calendarDayKeyInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dueCalendarDayKey(dueDate: Date): string {
  return dueDate.toISOString().slice(0, 10);
}

export function toDueDateIso(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
  ).toISOString();
}

export function parseDueDate(value: string): Date {
  const date = parseISO(value);
  if (!isValid(date)) {
    throw new Error("Invalid date value");
  }
  const [year, month, day] = dueCalendarDayKey(date).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDueDate(value: Date | string): string {
  return format(parseDueDate(typeof value === "string" ? value : value.toISOString()), "MMM d");
}

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

export function toIsoString(value: Date): string;
export function toIsoString(value: Date | null | undefined): string | null;
export function toIsoString(value: Date | null | undefined) {
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
