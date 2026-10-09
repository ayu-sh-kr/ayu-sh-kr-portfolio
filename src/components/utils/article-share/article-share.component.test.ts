import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {blogPosts} from "@app/configs/blogs.config.ts";
import {ArticleShareComponent} from "./article-share.component.ts";
import {getArticleShareData, getArticleShareUrl} from "./article-share.utils.ts";
import {getNewsNotes} from "@app/configs/news.config.ts";

vi.mock("@ayu-sh-kr/dota-wrap/core", () => ({
  BaseElement: class extends HTMLElement {},
  Component: () => () => {}, Property: () => () => {}, String: globalThis.String, BeforeInit: () => () => {},
  BindEvent: () => () => {}, WindowListener: () => () => {},
  ApplicationEventService: {getInstance: () => ({getPublisher: () => ({publishAsync: vi.fn()})})},
}));
vi.mock("@ayu-sh-kr/dota-wrap/event", () => ({OnEvent: () => () => {}}));

class TestArticleShare extends ArticleShareComponent {}
customElements.define("test-article-share", TestArticleShare);

const post = blogPosts[0]!;
let article: TestArticleShare;
let clipboard: ReturnType<typeof vi.fn>;

/** Calls the share handler with a native button event, keeping the article DOM intact. */
const click = async (action: string) => {
  const button = article.querySelector<HTMLButtonElement>(`[data-share-action="${action}"]`)!;
  const event = new Event("click");
  Object.defineProperty(event, "target", {value: button});
  await article.shareArticle(event);
  expect(button.disabled).toBe(false);
};

beforeEach(() => {
  window.history.replaceState(null, "", `/blog/${post.slug}/?utm_source=linkedin#example`);
  article = new TestArticleShare();
  article.articleTitle = post.header;
  article.author = post.writer;
  article.publicationDate = post.date;
  article.canonicalUrl = `https://www.ayu-sh-kr.com/blog/${post.slug}/?utm_source=linkedin#example`;
  article.innerHTML = '<button data-share-action="native"></button><button data-share-action="link"></button><button data-share-action="reference"></button><p data-share-status></p><textarea data-share-fallback hidden></textarea><article data-blog-markdown>Loaded article</article>';
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

describe("reusable article sharing", () => {
  it("copies the clean permalink and leaves loaded Markdown untouched", async () => {
    const markdown = article.querySelector("[data-blog-markdown]");
    await click("link");
    expect(clipboard).toHaveBeenCalledWith(`https://www.ayu-sh-kr.com/blog/${post.slug}/`);
    expect(article.querySelector("[data-blog-markdown]")).toBe(markdown);
    expect(article.querySelector("[data-share-status]")?.textContent).toBe("Link copied.");
  });

  it("copies title, author, publication date and canonical URL as a reference", async () => {
    await click("reference");
    expect(clipboard).toHaveBeenCalledWith(getArticleShareData({title: post.header, author: post.writer, date: post.date, url: article.canonicalUrl})!.reference);
    expect(clipboard.mock.calls[0]![0]).toContain(post.writer);
    expect(clipboard.mock.calls[0]![0]).toContain(post.header);
  });

  it("uses native sharing when supported without also copying", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {configurable: true, value: share});
    await click("native");
    expect(share).toHaveBeenCalledWith({title: post.header, url: getArticleShareData({title: post.header, author: post.writer, date: post.date, url: article.canonicalUrl})!.url});
    expect(clipboard).not.toHaveBeenCalled();
  });

  it("does not copy or display an error when native sharing is cancelled", async () => {
    Object.defineProperty(navigator, "share", {configurable: true, value: vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError"))});
    await click("native");
    expect(clipboard).not.toHaveBeenCalled();
    expect(article.querySelector("[data-share-status]")?.textContent).toBe("");
  });

  it("copies when native sharing is unavailable", async () => {
    await click("native");
    expect(clipboard).toHaveBeenCalledWith(getArticleShareData({title: post.header, author: post.writer, date: post.date, url: article.canonicalUrl})!.url);
  });

  it("reveals selectable reference text when clipboard permission is denied", async () => {
    clipboard.mockRejectedValue(new Error("Permission denied"));
    await click("reference");
    const fallback = article.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(fallback.hidden).toBe(false);
    expect(fallback.value).toBe(getArticleShareData({title: post.header, author: post.writer, date: post.date, url: article.canonicalUrl})!.reference);
    expect(document.activeElement).toBe(fallback);
  });

  it("encodes social links without leaking query strings or hashes", () => {
    const data = getArticleShareData({title: 'Java & Redis: "locks"', url: article.canonicalUrl})!;
    expect(new URL(getArticleShareUrl("linkedin", data)).searchParams.get("url")).toBe(data.url);
    expect(new URL(getArticleShareUrl("whatsapp", data)).searchParams.get("text")).toBe(`Java & Redis: "locks"\n${data.url}`);
    expect(data.reference).not.toContain("utm_source");
    expect(new URL(getArticleShareUrl("x", data)).searchParams.get("text")).toBe(data.title);
    expect(new URL(getArticleShareUrl("x", data)).searchParams.get("url")).toBe(data.url);
  });
  it("shares news metadata without relying on the browser's current blog route", async () => {
    const note = getNewsNotes()[0]!;
    article.articleTitle = note.title;
    article.canonicalUrl = `https://www.ayu-sh-kr.com/news/${note.slug}/`;
    article.publicationDate = note.date;
    await click("reference");
    expect(clipboard.mock.calls[0]![0]).toContain(note.title);
    expect(clipboard.mock.calls[0]![0]).toContain(`/news/${note.slug}/`);
    expect(clipboard.mock.calls[0]![0]).not.toContain(`/blog/${post.slug}/`);
  });

  it("renders labelled inline icons and hides unsafe or invalid destinations", () => {
    article.innerHTML = article.render();
    expect(article.querySelectorAll(".article-share-button")).toHaveLength(6);
    expect(article.querySelectorAll(".article-share-button svg[aria-hidden='true']")).toHaveLength(6);
    expect(article.querySelectorAll(".article-share-button[aria-label]")).toHaveLength(6);
    article.canonicalUrl = "javascript:alert(1)";
    expect(article.render()).toBe("");
    expect(getArticleShareData({title: "Invalid", url: "invalid"})).toBeNull();
  });

});
