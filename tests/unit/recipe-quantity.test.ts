import { describe, expect, it } from "vitest";
import { formatQuantityAsFraction } from "../../apps/web/src/lib/recipe-quantity";

describe("formatQuantityAsFraction", () => {
  it("converts common decimals to fractions", () => {
    expect(formatQuantityAsFraction("0.5")).toBe("1/2");
    expect(formatQuantityAsFraction("0.25")).toBe("1/4");
    expect(formatQuantityAsFraction("0.75")).toBe("3/4");
    expect(formatQuantityAsFraction("0.333")).toBe("1/3");
    expect(formatQuantityAsFraction("0.667")).toBe("2/3");
    expect(formatQuantityAsFraction("0.125")).toBe("1/8");
  });

  it("formats mixed numbers and integers", () => {
    expect(formatQuantityAsFraction("1.5")).toBe("1 1/2");
    expect(formatQuantityAsFraction("2")).toBe("2");
    expect(formatQuantityAsFraction("2.0")).toBe("2");
  });

  it("leaves non-decimal quantities alone", () => {
    expect(formatQuantityAsFraction("1/2")).toBe("1/2");
    expect(formatQuantityAsFraction("1 1/4")).toBe("1 1/4");
    expect(formatQuantityAsFraction("to taste")).toBe("to taste");
    expect(formatQuantityAsFraction("")).toBe("");
    expect(formatQuantityAsFraction(null)).toBe("");
  });
});
