import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {getNewsNotes} from "../../../../../configs/news.config.ts";
import {blogViewCountService} from "../../../../../service/blog-view-count.service.ts";
import {publishAnalyticsEvent} from "../../../../../utils/analytics.utils.ts";
import {NewsArticleComponent} from "./news-article.component.ts";

vi.mock("@ayu-sh-kr/dota-wrap/core", () => ({
  BaseElement: class extends HTMLElement {},
  Component: () => () => {},
  BeforeInit: () => () => {},
  WindowListener: () => () => {},
  ApplicationEventService: {getInstance: () => ({getPublisher: () => ({publishAsync: vi.fn()})})},
}));
vi.mock("@ayu-sh-kr/dota-wrap/event", () => ({OnEvent: () => () => {}}));
vi.mock("../../../../../service/blog-view-count.service.ts", () => ({
  blogViewCountService: {recordView: vi.fn()},
  toBlogViewTrackingFailureReason: () => "network",
}));
vi.mock("../../../../../utils/analytics.utils.ts", () => ({publishAnalyticsEvent: vi.fn()}));

class TestNewsArticleComponent extends NewsArticleComponent {
  constructor() {
    super();
  }
}

customElements.define("test-news-article", TestNewsArticleComponent);

describe("news article view tracking", () => {
  beforeEach(() => {
    vi.mocked(blogViewCountService.recordView).mockResolvedValue(null);
    vi.stubEnv("SSR", false);
    window.history.replaceState(null, "", `/news/${getNewsNotes()[0]!.slug}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    window.history.replaceState(null, "", "/");
  });

  it("records NEWS without waiting for tracking before loading Markdown", () => {
    vi.mocked(blogViewCountService.recordView).mockReturnValue(new Promise(() => {}));
    const article = new TestNewsArticleComponent();
    vi.spyOn(article, "scheduleProgress").mockImplementation(() => {});
    const load = vi.spyOn(article, "loadDocument").mockResolvedValue();

    article.initializeArticle();

    expect(blogViewCountService.recordView).toHaveBeenCalledWith(getNewsNotes()[0]!.slug, "NEWS");
    expect(load).toHaveBeenCalledWith(getNewsNotes()[0]);
  });

  it("records hydrated articles without fetching Markdown again", () => {
    const article = new TestNewsArticleComponent();
    article.hasHydratedArticle = true;
    vi.spyOn(article, "scheduleProgress").mockImplementation(() => {});
    const load = vi.spyOn(article, "loadDocument").mockResolvedValue();

    article.initializeArticle();

    expect(blogViewCountService.recordView).toHaveBeenCalledWith(getNewsNotes()[0]!.slug, "NEWS");
    expect(load).not.toHaveBeenCalled();
  });

  it("does not track missing articles", () => {
    window.history.replaceState(null, "", "/news/missing-test-article");
    const article = new TestNewsArticleComponent();
    vi.spyOn(article, "scheduleProgress").mockImplementation(() => {});
    const load = vi.spyOn(article, "loadDocument").mockResolvedValue();

    article.initializeArticle();

    expect(blogViewCountService.recordView).not.toHaveBeenCalled();
    expect(load).not.toHaveBeenCalled();
  });

  it("does not submit tracking during server rendering", () => {
    vi.stubEnv("SSR", true);
    const article = new TestNewsArticleComponent();
    vi.spyOn(article, "scheduleProgress").mockImplementation(() => {});

    article.initializeArticle();

    expect(blogViewCountService.recordView).not.toHaveBeenCalled();
  });

  it("reports a privacy-safe failure while keeping Markdown loading independent", async () => {
    vi.mocked(blogViewCountService.recordView).mockRejectedValue(new Error("offline"));
    const article = new TestNewsArticleComponent();
    vi.spyOn(article, "scheduleProgress").mockImplementation(() => {});
    const load = vi.spyOn(article, "loadDocument").mockResolvedValue();

    article.initializeArticle();
    await Promise.resolve();

    expect(load).toHaveBeenCalled();
    expect(publishAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "blog_view_tracking_failed", params: {reason: "network"},
    });
  });
});
