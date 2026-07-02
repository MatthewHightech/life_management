import { describe, expect, it } from "vitest";
import { folderDropId, parseFolderDropId, parseRecipeFolderDropId, recipeFolderDropId } from "@life/shared";

describe("folder drop ids", () => {
  it("builds namespace-aware drop ids", () => {
    expect(folderDropId("MEALS", null)).toBe("folder:MEALS:root");
    expect(folderDropId("RECEIPTS", "folder-1")).toBe("folder:RECEIPTS:folder-1");
  });

  it("parses namespace-aware drop ids", () => {
    expect(parseFolderDropId("folder:MEALS:root")).toEqual({ namespace: "MEALS", folderId: null });
    expect(parseFolderDropId("folder:RECEIPTS:folder-1")).toEqual({
      namespace: "RECEIPTS",
      folderId: "folder-1",
    });
    expect(parseFolderDropId("SUNDAY_BREAKFAST")).toBeUndefined();
  });

  it("keeps meal-plan aliases working", () => {
    expect(recipeFolderDropId("folder-1")).toBe("folder:MEALS:folder-1");
    expect(parseRecipeFolderDropId("folder:MEALS:folder-1")).toBe("folder-1");
  });
});
