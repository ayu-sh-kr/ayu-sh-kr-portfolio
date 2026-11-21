import {describe, expect, it} from "vitest";
import {archivePageNumber, archivePagePath, archiveSlice} from "./archive-page.utils.ts";

describe("archive URL ownership", () => {
  it("preserves the indexed URL and accepts only published numbers in the same section", () => {
    expect(archivePagePath(1)).toBe("/news/");
    expect(archivePageNumber("/news/", 18)).toBe(1);
    expect(archivePageNumber("/news/2/", 18)).toBe(2);
    for (const path of ["/blog/2/", "/news/1/", "/news/02/", "/news/3/", "/news/story/"]) {
      expect(archivePageNumber(path, 18)).toBeUndefined();
    }
  });

  it("places the final item on the next page exactly once", () => {
    const catalog = Array.from({length: 18}, (_, index) => index);
    expect(archiveSlice(catalog, 1)).toHaveLength(15);
    expect(archiveSlice(catalog, 2)).toEqual([15, 16, 17]);
  });
});
