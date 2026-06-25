import { describe, expect, it } from "vitest";
import { isEmailAllowlisted, parseAllowedEmails } from "@life/shared";

describe("parseAllowedEmails", () => {
  it("parses comma-separated emails and normalizes case", () => {
    expect(parseAllowedEmails(" Alice@Example.com , bob@example.com ")).toEqual([
      "alice@example.com",
      "bob@example.com",
    ]);
  });

  it("returns empty array for blank input", () => {
    expect(parseAllowedEmails("   ")).toEqual([]);
  });
});

describe("isEmailAllowlisted", () => {
  const allowed = ["alice@example.com"];

  it("allows listed emails", () => {
    expect(isEmailAllowlisted("Alice@Example.com", allowed)).toBe(true);
  });

  it("rejects unlisted emails", () => {
    expect(isEmailAllowlisted("other@example.com", allowed)).toBe(false);
  });

  it("rejects missing email", () => {
    expect(isEmailAllowlisted(undefined, allowed)).toBe(false);
  });
});
