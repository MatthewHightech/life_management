import { describe, expect, it } from "vitest";
import {
  dayBounds,
  formatCalendarGroupLabel,
  formatShortDate,
  parseOptionalDate,
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

  it("parses optional ISO dates", () => {
    expect(parseOptionalDate(null)).toBeNull();
    expect(parseOptionalDate("2025-06-24")).toBeInstanceOf(Date);
    expect(() => parseOptionalDate("not-a-date")).toThrow("Invalid date value");
  });

  it("formats dates for display", () => {
    const date = new Date(2025, 5, 24, 12, 0, 0);
    expect(formatShortDate(date)).toBe("Jun 24");
    expect(formatCalendarGroupLabel(date)).toBe("Tue, Jun 24");
  });

  it("serializes dates to ISO strings", () => {
    const date = new Date("2025-06-24T12:00:00.000Z");
    expect(toIsoString(date)).toBe("2025-06-24T12:00:00.000Z");
    expect(toIsoString(null)).toBeNull();
  });
});
