import { endOfDay, format, startOfDay, startOfWeek } from "date-fns";

export const GOAL_CADENCES = ["DAILY", "WEEKLY", "TERM"] as const;

export type GoalCadence = (typeof GOAL_CADENCES)[number];

export const GOAL_LIMITS: Record<GoalCadence, number> = {
  DAILY: 3,
  WEEKLY: 5,
  TERM: 10,
};

export const GOAL_CADENCE_LABELS: Record<GoalCadence, string> = {
  DAILY: "Daily Goals",
  WEEKLY: "Weekly Goals",
  TERM: "Term Goals",
};

export type TermWindow = {
  startMonth: number;
  endMonth: number;
  label: string;
};

/** Fixed term windows: Jan–Apr, May–Aug, Sep–Dec (0-indexed months). */
export const TERM_WINDOWS: TermWindow[] = [
  { startMonth: 0, endMonth: 3, label: "Jan–Apr" },
  { startMonth: 4, endMonth: 7, label: "May–Aug" },
  { startMonth: 8, endMonth: 11, label: "Sep–Dec" },
];

export function goalLimit(cadence: GoalCadence): number {
  return GOAL_LIMITS[cadence];
}

export function termWindowForDate(date: Date = new Date()): TermWindow & { year: number } {
  const month = date.getMonth();
  const window = TERM_WINDOWS.find((term) => month >= term.startMonth && month <= term.endMonth);
  if (!window) {
    throw new Error("Date is outside known term windows");
  }
  return { ...window, year: date.getFullYear() };
}

export function termBounds(date: Date = new Date()) {
  const term = termWindowForDate(date);
  const start = startOfDay(new Date(term.year, term.startMonth, 1));
  const endMonthLastDay = new Date(term.year, term.endMonth + 1, 0);
  const end = endOfDay(endMonthLastDay);
  return { start, end, term };
}

export function goalPeriodLabel(cadence: GoalCadence, date: Date = new Date()): string {
  if (cadence === "DAILY") {
    return format(date, "EEE, MMM d");
  }

  if (cadence === "WEEKLY") {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    return `Week of ${format(weekStart, "MMM d")}`;
  }

  const term = termWindowForDate(date);
  return `${term.label} ${term.year}`;
}

export type GoalCompletionInput = {
  totalCount: number;
  completedCount: number;
};

export function setHitRate(set: GoalCompletionInput): number {
  if (set.totalCount <= 0) {
    return 0;
  }
  return set.completedCount / set.totalCount;
}

export function isSetFullyComplete(set: GoalCompletionInput): boolean {
  return set.totalCount > 0 && set.completedCount >= set.totalCount;
}

/** Overall hit-rate across archived sets (completed ÷ total). */
export function archiveHitRate(sets: GoalCompletionInput[]): number {
  const totals = sets.reduce(
    (acc, set) => {
      acc.total += set.totalCount;
      acc.completed += set.completedCount;
      return acc;
    },
    { total: 0, completed: 0 },
  );

  if (totals.total <= 0) {
    return 0;
  }

  return totals.completed / totals.total;
}

/**
 * Consecutive fully-complete archived sets from newest → older.
 * Empty sets are skipped (do not break or extend the streak).
 */
export function archiveStreak(setsNewestFirst: GoalCompletionInput[]): number {
  let streak = 0;

  for (const set of setsNewestFirst) {
    if (set.totalCount <= 0) {
      continue;
    }
    if (!isSetFullyComplete(set)) {
      break;
    }
    streak += 1;
  }

  return streak;
}
