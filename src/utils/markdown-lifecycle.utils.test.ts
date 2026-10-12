import {afterEach, describe, expect, it, vi} from "vitest";
import type {MdViewComponent} from "@ayu-sh-kr/dota-md";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/** Adds a heading with the given literal ID and records whether it was scrolled into view. */
const addHeading = (id: string): {scrolled: () => boolean} => {
  const heading = document.createElement("h2");
  heading.id = id;
  let scrolled = false;
  heading.scrollIntoView = () => {
    scrolled = true;
  };
  document.body.append(heading);
  return {scrolled: () => scrolled};
};

describe("MarkdownLifecycleUtils.scheduleHashScroll", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    window.history.replaceState(null, "", "/");
    vi.unstubAllGlobals();
  });

  /** Runs the scheduled animation frame immediately. */
  const runFrames = (): void => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  };

  it("scrolls to a heading whose generated ID keeps percent-encoded punctuation", () => {
    runFrames();
    const heading = addHeading("error%3A-permission-denied-for-table-orders");
    window.history.replaceState(null, "", "/blog/postgresql-access-control/#error%3A-permission-denied-for-table-orders");

    new MarkdownLifecycleUtils(document.createElement("div") as unknown as MdViewComponent).scheduleHashScroll();

    expect(heading.scrolled()).toBe(true);
  });

  it("still scrolls to a plain ID reached through an encoded hash", () => {
    runFrames();
    const heading = addHeading("new tables");
    window.history.replaceState(null, "", "/blog/postgresql-access-control/#new%20tables");

    new MarkdownLifecycleUtils(document.createElement("div") as unknown as MdViewComponent).scheduleHashScroll();

    expect(heading.scrolled()).toBe(true);
  });
});
