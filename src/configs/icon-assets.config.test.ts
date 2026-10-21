import assert from "node:assert/strict";
import { afterEach, describe, it, vi } from "vitest";
import { LocalIconSets } from "./icon-assets.config.ts";

describe("LocalIconSets", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the header and share icons without network access", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    const sets = new LocalIconSets();

    for (const name of ["material-symbols:menu-rounded", "lucide:share-2", "ri:linkedin-fill"]) {
      const svg = await sets.get(name);
      assert.match(svg ?? "", /^<svg[\s>].*<\/svg>$/s, name);
    }
  });

  it("returns null for collections that are not installed or unknown icons", async () => {
    const sets = new LocalIconSets();

    assert.equal(await sets.get("tabler:home"), null);
    assert.equal(await sets.get("lucide:not-an-icon"), null);
    assert.equal(await sets.get("invalid"), null);
  });
});
