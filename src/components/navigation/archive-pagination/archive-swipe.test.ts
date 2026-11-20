import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render } from "@ayu-sh-kr/dota-wrap/rendering";
import { getNewsNotes } from "@app/configs/news.config.ts";
import { resolvePagerVariant } from "@app/configs/archive-pagination.config.ts";
import { RouterUtils } from "@app/utils/router.utils.ts";
import { renderArchivePagination } from "./archive-pagination.ts";
import { ArchiveSwipe } from "./archive-swipe.ts";
import { summarizePage, type PagerVariant } from "./pager-contract.ts";

beforeAll(() => {
  if (!customElements.get("archive-swipe")) customElements.define("archive-swipe", ArchiveSwipe);
});
afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function fixture(variant: PagerVariant = "date-reel") {
  const root = document.createElement("div");
  render(root, renderArchivePagination(2, getNewsNotes()));
  const host = root.querySelector<HTMLElement>("archive-swipe")!;
  host.dataset.variant = variant;
  document.body.append(root);
  const stage = host.querySelector<HTMLElement>(".pager-stage")!;
  vi.spyOn(stage, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 150, 46));
  host.setPointerCapture = vi.fn();
  const navigate = vi.spyOn(RouterUtils, "navigate").mockImplementation(() => { });
  let frame: FrameRequestCallback | undefined;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frame = callback; return 1; });
  vi.stubGlobal("cancelAnimationFrame", () => { frame = undefined; });
  const pointer = (type: string, x: number, y = 100) => stage.dispatchEvent(new PointerEvent(type, {
    pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, clientX: x, clientY: y, bubbles: true,
  }));
  return { host, navigate, pointer, finish: () => frame?.(performance.now() + 500) };
}

describe("archive pagination contract", () => {
  it("resolves the environment before the configured fallback", () => {
    expect(resolvePagerVariant(undefined)).toBe("date-reel");
    expect(resolvePagerVariant("", "story-stack")).toBe("story-stack");
    expect(resolvePagerVariant("unknown", "index-lens")).toBe("index-lens");
    for (const variant of ["index-lens", "date-reel", "story-stack"]) {
      expect(resolvePagerVariant(variant)).toBe(variant);
    }
  });

  it("uses real entries for partial-page previews", () => {
    const entries = Array.from({ length: 16 }, (_, i) => ({ title: "Post " + i, date: "2026-11-20" }));
    expect(summarizePage(entries, 2)).toEqual({
      dates: "Nov 20, 2026", count: 1, headlines: ["Post 15"], first: 16, last: 16,
    });
  });

  it.each(["index-lens", "date-reel", "story-stack"] as const)("mounts %s on intent and disposes before navigation", variant => {
    const { host, pointer, navigate, finish } = fixture(variant);
    const lens = variant === "index-lens";
    pointer("pointerdown", 100);
    expect(host.querySelector(".pager-motion")).toBeNull();
    pointer("pointermove", lens ? 135 : 50);
    expect(host.querySelectorAll(".motion-key")).toHaveLength(lens ? 5 : 3);
    if (variant === "story-stack") expect(host.querySelectorAll(".pager-story")).toHaveLength(2);
    expect(host.querySelector(".pager-preview")!.textContent).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
    pointer("pointerup", lens ? 135 : 50);
    finish();
    expect(navigate.mock.calls).toEqual([[lens ? "/news/5/" : "/news/3/"]]);
    expect(host.hasAttribute("data-turning")).toBe(false);
    expect(host.querySelector(".pager-motion")).toBeNull();
  });

  it.each(["cancel", "vertical", "disconnect", "reverse"])("does not navigate on %s", mode => {
    const { host, pointer, navigate, finish } = fixture();
    pointer("pointerdown", 100);
    pointer("pointermove", 50, mode === "vertical" ? 180 : 100);
    if (mode === "vertical") expect(host.setPointerCapture).not.toHaveBeenCalled();
    if (mode === "disconnect") host.remove();
    else pointer(mode === "cancel" ? "pointercancel" : "pointerup", mode === "reverse" ? 100 : 50);
    finish();
    expect(host.querySelector(".pager-motion")).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("synchronizes the bookmark inputs and commits only a valid destination", () => {
    const { host, navigate } = fixture();
    host.querySelector<HTMLButtonElement>(".pager-bookmark")!.click();
    const dialog = host.querySelector("dialog")!;
    const number = dialog.querySelector<HTMLInputElement>('[type="number"]')!;
    const slider = dialog.querySelector<HTMLInputElement>('[type="range"]')!;
    const form = dialog.querySelector("form")!;
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(number);
    number.value = "999";
    number.dispatchEvent(new Event("input"));
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(navigate).not.toHaveBeenCalled();
    slider.value = "3";
    slider.dispatchEvent(new Event("input"));
    expect(number.value).toBe("3");
    expect(dialog.querySelector(".finder-preview")?.textContent).toContain("Entries 31–45");
    number.value = "1";
    number.dispatchEvent(new Event("input"));
    expect(slider.value).toBe("1");
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(navigate.mock.calls).toEqual([["/news/"]]);
    expect(dialog.open).toBe(false);
  });
});
