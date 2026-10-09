import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {AnalyticsJourneyTracker} from "./analytics-journey-tracker.service.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

vi.mock("@app/utils/analytics.utils.ts", () => ({publishAnalyticsEvent: vi.fn()}));

describe("analytics journeys", () => {
  let tracker: AnalyticsJourneyTracker;
  let frame: FrameRequestCallback | null;

  beforeEach(() => {
    vi.clearAllMocks();
    frame = null;
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { frame = callback; return 1; }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn(() => { frame = null; }));
    window.history.replaceState({}, "", "/blog/example");
    document.body.innerHTML = '<div id="app"></div>';
    tracker = new AnalyticsJourneyTracker();
    tracker.start();
    tracker.trackPage(window.location.pathname);
  });

  afterEach(() => {
    tracker.disconnect();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const flushFrame = () => { const callback = frame; frame = null; callback?.(0); };

  it("tracks one form start per route without exposing typed values", () => {
    document.getElementById("app")!.innerHTML = '<blog-subscription><input value="private@example.com"></blog-subscription>';
    const input = document.querySelector("input")!;
    input.dispatchEvent(new Event("input", {bubbles: true}));
    input.dispatchEvent(new Event("input", {bubbles: true}));
    tracker.trackPage(window.location.pathname);
    input.dispatchEvent(new Event("change", {bubbles: true}));
    expect(publishAnalyticsEvent).toHaveBeenCalledExactlyOnceWith({eventName: "form_start", params: {form_name: "blog_subscription"}});
    window.history.replaceState({}, "", "/news");
    tracker.trackPage("/news");
    input.dispatchEvent(new Event("input", {bubbles: true}));
    expect(publishAnalyticsEvent).toHaveBeenCalledTimes(2);
  });

  it("coalesces invalid fields without collecting their names or values", () => {
    document.getElementById("app")!.innerHTML = '<pricing-start-project><input><input></pricing-start-project>';
    document.querySelectorAll("input").forEach((input) => input.dispatchEvent(new Event("invalid")));
    expect(publishAnalyticsEvent).toHaveBeenCalledExactlyOnceWith({eventName: "form_error", params: {form_name: "project_brief", reason: "validation"}});
  });

  it("tracks chrome navigation and Dispatch discovery without URL tokens", () => {
    document.getElementById("app")!.innerHTML = '<app-header><a href="/news/note?token=secret#detail"><span>Read</span></a></app-header>';
    document.querySelector("a")!.addEventListener("click", (event) => event.preventDefault());
    document.querySelector("span")!.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true}));
    expect(publishAnalyticsEvent).toHaveBeenCalledWith({eventName: "navigation_click", params: {surface: "header", destination: "/news/note"}});
    expect(publishAnalyticsEvent).toHaveBeenCalledWith({eventName: "news_open", params: {slug: "note"}});
    expect(JSON.stringify(vi.mocked(publishAnalyticsEvent).mock.calls)).not.toContain("secret");
  });

  it("ignores external navigation", () => {
    document.getElementById("app")!.innerHTML = '<app-footer><a href="https://example.com/private?token=secret">External</a></app-footer>';
    document.querySelector("a")!.addEventListener("click", (event) => event.preventDefault());
    document.querySelector("a")!.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true}));
    expect(publishAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("waits for content readiness and deduplicates reading depth", () => {
    document.getElementById("app")!.innerHTML = '<article aria-busy="true"><div class="blog-markdown-content"><p>Content</p></div></article>';
    const content = document.querySelector<HTMLElement>(".blog-markdown-content")!;
    vi.spyOn(content, "getBoundingClientRect").mockReturnValue({height: 1000, top: window.innerHeight - 510} as DOMRect);
    flushFrame();
    expect(publishAnalyticsEvent).not.toHaveBeenCalled();
    document.querySelector("article")!.setAttribute("aria-busy", "false");
    window.dispatchEvent(new Event("scroll"));
    flushFrame();
    expect(vi.mocked(publishAnalyticsEvent).mock.calls.map(([event]) => event.params)).toEqual([
      {kind: "blog", slug: "example", percent: 25}, {kind: "blog", slug: "example", percent: 50},
    ]);
    window.dispatchEvent(new Event("scroll"));
    flushFrame();
    expect(publishAnalyticsEvent).toHaveBeenCalledTimes(2);
    vi.spyOn(content, "getBoundingClientRect").mockReturnValue({height: 1000, top: window.innerHeight - 1000} as DOMRect);
    window.dispatchEvent(new Event("scroll"));
    flushFrame();
    expect(publishAnalyticsEvent).toHaveBeenCalledWith({eventName: "content_progress", params: {kind: "blog", slug: "example", percent: 100}});
  });

  it("does not count background content or pending frames after disconnect", () => {
    document.getElementById("app")!.innerHTML = '<div class="blog-markdown-content"><p>Content</p></div>';
    vi.spyOn(document.querySelector(".blog-markdown-content")!, "getBoundingClientRect").mockReturnValue({height: 100, top: 0} as DOMRect);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    flushFrame();
    expect(publishAnalyticsEvent).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("scroll"));
    tracker.disconnect();
    expect(frame).toBeNull();
    window.dispatchEvent(new Event("scroll"));
    expect(frame).toBeNull();
  });
});
