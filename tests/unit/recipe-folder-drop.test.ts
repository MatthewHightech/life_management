import { describe, expect, it } from "vitest";
import { parseRecipeFolderDropId, recipeFolderDropId } from "@life/shared";

describe("recipe folder drop ids", () => {
  it("builds root and folder drop ids", () => {
    expect(recipeFolderDropId(null)).toBe("recipe-folder:root");
    expect(recipeFolderDropId("folder-1")).toBe("recipe-folder:folder-1");
  });

  it("parses folder drop ids", () => {
    expect(parseRecipeFolderDropId("recipe-folder:root")).toBeNull();
    expect(parseRecipeFolderDropId("recipe-folder:folder-1")).toBe("folder-1");
    expect(parseRecipeFolderDropId("SUNDAY_BREAKFAST")).toBeUndefined();
  });
});
