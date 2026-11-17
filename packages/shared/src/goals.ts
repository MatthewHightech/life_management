import { format, startOfWeek } from "date-fns";

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

const TERM_WINDOWS = [
  { startMonth: 0, endMonth: 3, label: "Jan–Apr" },
  { startMonth: 4, endMonth: 7, label: "May–Aug" },
  { startMonth: 8, endMonth: 11, label: "Sep–Dec" },
];

export function termWindowForDate(date: Date = new Date()) {
  const month = date.getMonth();
  const window = TERM_WINDOWS.find((term) => month >= term.startMonth && month <= term.endMonth);
  if (!window) {
    throw new Error("Date is outside known term windows");
  }
  return { ...window, year: date.getFullYear() };
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

type GoalCompletionInput = {
  totalCount: number;
  completedCount: number;
};

export function archiveHitRate(sets: GoalCompletionInput[]): number {
  const total = sets.reduce((sum, set) => sum + set.totalCount, 0);
  const completed = sets.reduce((sum, set) => sum + set.completedCount, 0);
  return total > 0 ? completed / total : 0;
}

export function archiveStreak(setsNewestFirst: GoalCompletionInput[]): number {
  let streak = 0;

  for (const set of setsNewestFirst) {
    if (set.totalCount <= 0) {
      continue;
    }
    if (set.completedCount < set.totalCount) {
      break;
    }
    streak += 1;
  }

  return streak;
}
