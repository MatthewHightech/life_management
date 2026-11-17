import { describe, expect, it } from "vitest";
import {
  buildMonthGrid,
  dayBounds,
  formatDueDate,
  formatLongDate,
  formatShortDate,
  isPastDueDate,
  parseDueDate,
  parseOptionalDate,
  toDueDateIso,
  toIsoString,
} from "@life/shared";

describe("shared dates", () => {
  it("returns start and end of day", () => {
    const date = new Date("2025-06-24T15:30:00");
    const { start, end } = dayBounds(date);

    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });

  it("marks date-only dues overdue only after that Pacific calendar day ends", () => {
    // Legacy local-midnight shapes (PDT 07:00Z / PST 08:00Z) and UTC-noon
    const duePdtMidnight = new Date("2026-11-06T07:00:00.000Z");
    const duePstMidnight = new Date("2026-11-06T08:00:00.000Z");
    const dueUtcNoon = new Date("2026-11-06T12:00:00.000Z");

    for (const dueNov6 of [duePdtMidnight, duePstMidnight, dueUtcNoon]) {
      expect(isPastDueDate(dueNov6, new Date("2026-11-06T06:59:59.000Z"))).toBe(false); // Nov 5 10:59pm PT
      expect(isPastDueDate(dueNov6, new Date("2026-11-07T00:00:00.000Z"))).toBe(false); // Nov 6 4:00pm PT
      expect(isPastDueDate(dueNov6, new Date("2026-11-07T07:59:59.000Z"))).toBe(false); // Nov 6 11:59pm PT
      expect(isPastDueDate(dueNov6, new Date("2026-11-07T08:00:00.000Z"))).toBe(true); // Nov 7 12:00am PT
    }
  });

  it("stores and displays due dates by calendar day, not local midnight instant", () => {
    const picked = new Date(2026, 10, 6, 15, 30, 0);
    expect(toDueDateIso(picked)).toBe("2026-11-06T12:00:00.000Z");
    expect(formatDueDate("2026-11-06T07:00:00.000Z")).toBe("Nov 6");
    expect(parseDueDate("2026-11-06T07:00:00.000Z")).toEqual(new Date(2026, 10, 6));
  });



  it("parses optional ISO dates", () => {
    expect(parseOptionalDate(null)).toBeNull();
    expect(parseOptionalDate("2025-06-24")).toBeInstanceOf(Date);
    expect(() => parseOptionalDate("not-a-date")).toThrow("Invalid date value");
  });

  it("formats dates for display", () => {
    const date = new Date(2025, 5, 24, 12, 0, 0);
    expect(formatShortDate(date)).toBe("Jun 24");
    expect(formatLongDate(date)).toBe("June 24, 2025");
    expect(formatLongDate("2026-07-17")).toBe("July 17, 2026");
  });

  it("serializes dates to ISO strings", () => {
    const date = new Date("2025-06-24T12:00:00.000Z");
    expect(toIsoString(date)).toBe("2025-06-24T12:00:00.000Z");
    expect(toIsoString(null)).toBeNull();
  });


  it("builds a month grid for calendars", () => {
    const days = buildMonthGrid(new Date(2025, 5, 1));
    expect(days.length % 7).toBe(0);
    expect(days.some((day) => formatShortDate(day) === "Jun 1")).toBe(true);
  });
});
