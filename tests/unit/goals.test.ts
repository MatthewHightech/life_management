import { describe, expect, it } from "vitest";
import {
  GOAL_LIMITS,
  archiveHitRate,
  archiveStreak,
  goalPeriodLabel,
  termWindowForDate,
} from "@life/shared";

describe("goals helpers", () => {
  it("exposes cadence caps", () => {
    expect(GOAL_LIMITS.DAILY).toBe(3);
    expect(GOAL_LIMITS.WEEKLY).toBe(5);
    expect(GOAL_LIMITS.TERM).toBe(10);
  });

  it("resolves fixed term windows", () => {
    expect(termWindowForDate(new Date(2026, 0, 15)).label).toBe("Jan–Apr");
    expect(termWindowForDate(new Date(2026, 5, 1)).label).toBe("May–Aug");
    expect(termWindowForDate(new Date(2026, 10, 30)).label).toBe("Sep–Dec");
  });

  it("formats period labels", () => {
    const day = new Date(2026, 10, 2);
    expect(goalPeriodLabel("DAILY", day)).toContain("Nov");
    expect(goalPeriodLabel("WEEKLY", day)).toMatch(/^Week of/);
    expect(goalPeriodLabel("TERM", day)).toBe("Sep–Dec 2026");
  });

  it("computes hit-rate and streak", () => {
    const sets = [
      { totalCount: 3, completedCount: 3 },
      { totalCount: 3, completedCount: 3 },
      { totalCount: 0, completedCount: 0 },
      { totalCount: 3, completedCount: 1 },
    ];

    expect(archiveHitRate(sets)).toBeCloseTo(7 / 9);
    expect(archiveStreak(sets)).toBe(2);
  });
});
