import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {blogPosts} from "@app/configs/blogs.config.ts";
import {BlogArticleComponent} from "./blog-article.component.ts";
import {getBlogShareData} from "./blog-share.utils.ts";

vi.mock("@ayu-sh-kr/dota-wrap/core", () => ({
  BaseElement: class extends HTMLElement {},
  Component: () => () => {}, BeforeInit: () => () => {},
  BindEvent: () => () => {}, WindowListener: () => () => {},
  ApplicationEventService: {getInstance: () => ({getPublisher: () => ({publishAsync: vi.fn()})})},
}));
vi.mock("@ayu-sh-kr/dota-wrap/event", () => ({OnEvent: () => () => {}}));

class TestBlogArticle extends BlogArticleComponent {}
customElements.define("test-blog-share-article", TestBlogArticle);

const post = blogPosts[0]!;
let article: TestBlogArticle;
let clipboard: ReturnType<typeof vi.fn>;

/** Calls the share handler with a native button event, keeping the article DOM intact. */
const click = async (action: string) => {
  const button = article.querySelector<HTMLButtonElement>(`[data-blog-share-action="${action}"]`)!;
  const event = new Event("click");
  Object.defineProperty(event, "target", {value: button});
  await article.shareArticle(event);
  expect(button.disabled).toBe(false);
};

beforeEach(() => {
  window.history.replaceState(null, "", `/blog/${post.slug}/?utm_source=linkedin#example`);
  article = new TestBlogArticle();
  article.innerHTML = '<button data-blog-share-action="native"></button><button data-blog-share-action="link"></button><button data-blog-share-action="reference"></button><p data-blog-share-status></p><textarea data-blog-share-fallback hidden></textarea><article data-blog-markdown>Loaded article</article>';
  document.body.append(article);
  clipboard = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: clipboard}});
  Object.defineProperty(navigator, "share", {configurable: true, value: undefined});
});

afterEach(() => {
  article.remove();
  vi.restoreAllMocks();
  delete (navigator as unknown as Record<string, unknown>).share;
  delete (navigator as unknown as Record<string, unknown>).clipboard;
  window.history.replaceState(null, "", "/");
});

describe("blog sharing", () => {
  it("copies the clean permalink and leaves loaded Markdown untouched", async () => {
    const markdown = article.querySelector("[data-blog-markdown]");
    await click("link");
    expect(clipboard).toHaveBeenCalledWith(`https://www.ayu-sh-kr.com/blog/${post.slug}/`);
    expect(article.querySelector("[data-blog-markdown]")).toBe(markdown);
    expect(article.querySelector("[data-blog-share-status]")?.textContent).toBe("Link copied.");
  });

  it("copies title, author, publication date and canonical URL as a reference", async () => {
    await click("reference");
    expect(clipboard).toHaveBeenCalledWith(getBlogShareData(post).reference);
    expect(clipboard.mock.calls[0]![0]).toContain(post.writer);
    expect(clipboard.mock.calls[0]![0]).toContain(post.header);
  });

  it("uses native sharing when supported without also copying", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {configurable: true, value: share});
    await click("native");
    expect(share).toHaveBeenCalledWith({title: post.header, url: getBlogShareData(post).url});
    expect(clipboard).not.toHaveBeenCalled();
  });

  it("does not copy or display an error when native sharing is cancelled", async () => {
    Object.defineProperty(navigator, "share", {configurable: true, value: vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError"))});
    await click("native");
    expect(clipboard).not.toHaveBeenCalled();
    expect(article.querySelector("[data-blog-share-status]")?.textContent).toBe("");
  });

  it("copies when native sharing is unavailable", async () => {
    await click("native");
    expect(clipboard).toHaveBeenCalledWith(getBlogShareData(post).url);
  });

  it("reveals selectable reference text when clipboard permission is denied", async () => {
    clipboard.mockRejectedValue(new Error("Permission denied"));
    await click("reference");
    const fallback = article.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(fallback.hidden).toBe(false);
    expect(fallback.value).toBe(getBlogShareData(post).reference);
    expect(document.activeElement).toBe(fallback);
  });

  it("encodes social links without leaking query strings or hashes", () => {
    const data = getBlogShareData({...post, header: 'Java & Redis: "locks"'});
    expect(new URL(data.linkedin).searchParams.get("url")).toBe(data.url);
    expect(new URL(data.whatsapp).searchParams.get("text")).toBe(`Java & Redis: "locks"\n${data.url}`);
    expect(data.reference).not.toContain("utm_source");
  });
});
