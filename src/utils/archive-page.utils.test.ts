import {describe, expect, it} from "vitest";
import {archivePageNumber, archivePagePath, archiveSlice} from "./archive-page.utils.ts";

describe("archive URL ownership", () => {
  it("preserves the indexed URL and accepts only published numbers in the same section", () => {
    expect(archivePagePath("news", 1)).toBe("/news/");
    expect(archivePageNumber("/news/", "news", 13)).toBe(1);
    expect(archivePageNumber("/news/2/", "news", 13)).toBe(2);
    for (const path of ["/blog/2/", "/news/1/", "/news/02/", "/news/3/", "/news/story/"]) {
      expect(archivePageNumber(path, "news", 13)).toBeUndefined();
    }
  });

  it("places the final item on the next page exactly once", () => {
    const catalog = Array.from({length: 13}, (_, index) => index);
    expect(archiveSlice(catalog, 1)).toHaveLength(10);
    expect(archiveSlice(catalog, 2)).toEqual([10, 11, 12]);
  });
});
