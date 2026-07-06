import { describe, expect, it } from "vitest";
import {
  canLendGearCondition,
  parseGearDragId,
  validateBorrowerEmail,
  validateLoanDates,
} from "@life/shared";

describe("gear validation", () => {
  it("rejects retired items for lending", () => {
    expect(canLendGearCondition("LIKE_NEW")).toBe(true);
    expect(canLendGearCondition("GOOD")).toBe(true);
    expect(canLendGearCondition("FAIR")).toBe(true);
    expect(canLendGearCondition("RETIRED")).toBe(false);
  });

  it("requires return-by after lent date", () => {
    const lentAt = new Date("2026-07-01T00:00:00.000Z");
    const returnBy = new Date("2026-07-02T00:00:00.000Z");
    expect(() => validateLoanDates(lentAt, returnBy)).not.toThrow();

    const sameDay = new Date("2026-07-01T00:00:00.000Z");
    expect(() => validateLoanDates(lentAt, sameDay)).toThrow(/after lent date/);
  });

  it("validates borrower email", () => {
    expect(validateBorrowerEmail("friend@example.com")).toBe("friend@example.com");
    expect(() => validateBorrowerEmail("")).toThrow(/required/);
    expect(() => validateBorrowerEmail("not-an-email")).toThrow(/invalid/i);
  });

  it("parses gear drag ids", () => {
    expect(parseGearDragId("gear-item:abc")).toEqual({ kind: "item", id: "abc" });
    expect(parseGearDragId("gear-variant:xyz")).toEqual({ kind: "variant", id: "xyz" });
    expect(parseGearDragId("gear-class:cls")).toEqual({ kind: "class", id: "cls" });
    expect(parseGearDragId("folder:GEAR:root")).toBeUndefined();
  });
});
