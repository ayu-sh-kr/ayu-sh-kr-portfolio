import {afterEach, beforeAll, describe, expect, it, vi} from "vitest";
import {ArchiveSwipe} from "./archive-swipe.ts";

beforeAll(() => customElements.define("archive-swipe", ArchiveSwipe));
afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

/** Exercise the same link activation path as a touch browser without navigating the test document. */
function fixture(page = 2) {
  const strip = document.createElement("archive-swipe");
  strip.dataset.page = String(page);
  strip.dataset.total = "4";
  strip.innerHTML = `${page === 1 ? "" : '<a rel="prev" href="/news/">Previous</a>'}
    <div class="pager-stage"><div class="pager-numbers"></div></div>
    <a rel="next" href="/news/${page + 1}/">Next</a>`;
  const capture = vi.fn();
  strip.setPointerCapture = capture;
  const followed = vi.fn((event: MouseEvent) => event.preventDefault());
  document.body.addEventListener("click", followed, {once: true});
  document.body.append(strip);
  let frame: FrameRequestCallback | undefined;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frame = callback; return 1; });
  vi.stubGlobal("cancelAnimationFrame", () => {frame = undefined;});
  const pointer = (type: string, x: number, y = 100, target: Element = strip) =>
    target.dispatchEvent(new PointerEvent(type, {pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, clientX: x, clientY: y, bubbles: true}));
  return {strip, capture, followed, pointer, finish: () => frame?.(performance.now() + 500)};
}

describe("archive gestures", () => {
  it("follows the finger in both directions and commits the release direction once", () => {
    const {strip, pointer, finish, followed} = fixture();
    pointer("pointerdown", 150);
    pointer("pointermove", 100);
    expect(strip.querySelector<HTMLElement>(".pager-motion")!.style.getPropertyValue("--p")).toBe(String(50 / 104));
    pointer("lostpointercapture", 100, 100, strip.querySelector("a")!);
    pointer("pointermove", 225);
    expect(strip.querySelector<HTMLElement>(".pager-motion")!.dataset.direction).toBe("-1");
    pointer("pointerup", 225);
    finish();
    expect(followed).toHaveBeenCalledTimes(1);
    expect((followed.mock.calls[0][0].target as HTMLAnchorElement).rel).toBe("prev");
  });

  it.each(["short drag", "cancel", "vertical scroll", "first-page boundary"])("stays on the page after %s", mode => {
    const {strip, pointer, finish, followed, capture} = fixture(mode === "first-page boundary" ? 1 : 2);
    pointer("pointerdown", 110);
    const end = mode === "short drag" ? 101 : 190;
    const y = mode === "vertical scroll" ? 220 : 100;
    pointer("pointermove", end, y);
    pointer(mode === "cancel" ? "pointercancel" : "pointerup", end, y);
    finish();
    expect(strip.querySelector(".pager-motion")).toBeNull();
    expect(followed).not.toHaveBeenCalled();
    if (mode === "vertical scroll") expect(capture).not.toHaveBeenCalled();
  });
});
