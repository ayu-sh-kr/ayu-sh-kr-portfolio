import "reflect-metadata";
import {expect, it} from "vitest";
import {hydrate, html, render, setHydrationEmit, trustedHTML, update} from "@ayu-sh-kr/dota-wrap/rendering";
import {BlogArticleHeaderComponent} from "@app/components/pages/blog/article/blog-article-header/blog-article-header.component.ts";
import {ShowcaseArticleHeaderComponent} from "@app/components/pages/showcase/article/showcase-article-header/showcase-article-header.component.ts";
import {BlogListComponent} from "@app/components/pages/blog/index/archive/blog-list/blog-list.component.ts";
import {BlogHighlightedBlogComponent} from "@app/components/pages/blog/index/archive/blog-highlighted-blog/blog-highlighted-blog.component.ts";
import {BlogRelatedPostsComponent} from "@app/components/pages/blog/article/blog-related-posts/blog-related-posts.component.ts";
import {CoffeeSizePickerComponent} from "@app/components/pages/coffee/order/coffee-size-picker/coffee-size-picker.component.ts";
import {PrivacyDocumentHeaderComponent} from "@app/components/pages/privacy/document/privacy-document-header/privacy-document-header.component.ts";
import {TermsDocumentHeaderComponent} from "@app/components/pages/terms/document/terms-document-header/terms-document-header.component.ts";
import {blogPosts, getBlogPostsForIndex, getLatestBlogPost, getRelatedBlogPosts} from "@app/configs/blogs.config.ts";
import {coffeeContent} from "@app/data/coffee-content.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";

const text = `R&D <em>literal</em> "quotes" 'apostrophes' &amp; </script><script>unsafe()</script>`;
const components = [BlogArticleHeaderComponent, ShowcaseArticleHeaderComponent, BlogListComponent, BlogHighlightedBlogComponent, BlogRelatedPostsComponent, CoffeeSizePickerComponent, PrivacyDocumentHeaderComponent, TermsDocumentHeaderComponent];
for (const Component of components) customElements.define(`contract-${Component.name.toLowerCase()}`, Component);

it.each([BlogArticleHeaderComponent, ShowcaseArticleHeaderComponent])("preserves literal header copy through mount, serialization, hydration, and update", (Component) => {
  const component = new Component();
  Object.assign(component, {title: text, category: text, metadata: text, writer: text, kind: text, year: text, status: text, tagline: text, stack: text});
  setHydrationEmit(true);
  const server = document.createElement("div");
  const serverView = render(server, component.render());
  setHydrationEmit(false);
  const root = document.createElement("div");
  root.innerHTML = server.innerHTML;
  for (const attribute of server.attributes) root.setAttribute(attribute.name, attribute.value);
  const heading = root.querySelector("h1");
  const view = hydrate(root, component.render(), {mismatch: "throw"});
  expect(heading?.textContent).toBe(text);
  expect(root.querySelector("em, script")).toBeNull();
  component.title = `Updated ${text}`;
  update(view, component.render());
  expect(root.querySelector("h1")).toBe(heading);
  expect(heading?.textContent).toBe(`Updated ${text}`);
  view.dispose();
  serverView.dispose();
});

it.each([PrivacyDocumentHeaderComponent, TermsDocumentHeaderComponent])("does not double-escape legal metadata and keeps raw summary items safe", (Component) => {
  const component = new Component();
  component.metadata = JSON.stringify({version: text, title: text, tagline: text, applies: text, governingLaw: text, summaryNote: text, summary: [text], updated: "2026-10-17", effective: "2026-10-17"});
  const root = document.createElement("div");
  render(root, component.render());
  expect(root.querySelector("h1")?.textContent).toBe(text);
  expect(root.querySelector("li")?.textContent).toBe(text);
  expect(root.querySelector("em, script")).toBeNull();
  expect(root.textContent).toContain(`Version ${text}`);
});

it("keeps archive rows ordered, complete, and free from array separators", () => {
  const root = document.createElement("div");
  const component = new BlogListComponent();
  render(root, component.render());
  const posts = getBlogPostsForIndex();
  const latest = getLatestBlogPost(posts);
  const expected = posts.filter((post) => post.slug !== latest?.slug);
  expect([...root.querySelectorAll(".blog-row")].map((row) => row.getAttribute("data-analytics-slug"))).toEqual(expected.map((post) => post.slug));
  expect([...root.querySelectorAll(".blog-row-title")].map((title) => title.textContent?.trim())).toEqual(expected.map((post) => post.header));
  expect([...root.querySelector(".blog-list")!.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).every((node) => !node.textContent?.trim())).toBe(true);
});

it("renders coffee template arrays as sibling buttons with nested featured flags", () => {
  const root = document.createElement("div");
  render(root, new CoffeeSizePickerComponent().render());
  expect([...root.querySelectorAll("[data-coffee-size]")].map((button) => button.getAttribute("data-coffee-size"))).toEqual(coffeeContent.sizes.map((size) => size.id));
  expect(root.querySelectorAll(".coffee-pick-flag")).toHaveLength(coffeeContent.sizes.filter((size) => size.featured).length);
  expect([...root.querySelector(".coffee-pick-grid")!.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).every((node) => !node.textContent?.trim())).toBe(true);
});

it("keeps hostile catalog titles as text in highlighted, archive, and related cards", () => {
  const originals = blogPosts.map((post) => post.header);
  try {
    blogPosts.forEach((post) => { (post as {header: string}).header = text; });
    const related = new BlogRelatedPostsComponent();
    const seed = blogPosts.find((post) => getRelatedBlogPosts(post).length > 0)!;
    related.slug = seed.slug;
    for (const component of [new BlogHighlightedBlogComponent(), new BlogListComponent(), related]) {
      const root = document.createElement("div");
      render(root, component.render());
      const titles = root.querySelectorAll(".blog-featured h2, .blog-row-title, .blog-related-heading");
      expect(titles.length).toBeGreaterThan(0);
      titles.forEach((title) => expect(title.textContent?.trim()).toBe(text));
      expect(root.querySelector("em, script")).toBeNull();
    }
  } finally {
    blogPosts.forEach((post, index) => { (post as {header: string}).header = originals[index]!; });
  }
});

it("preserves quoted attributes and keeps escapeHtml at explicit raw-markup boundaries", () => {
  const root = document.createElement("div");
  render(root, html`<section aria-label="${text}">${text}${trustedHTML(`<p>${escapeHtml(text)}</p>`)}</section>`);
  expect(root.querySelector("section")?.getAttribute("aria-label")).toBe(text);
  expect(root.querySelector("p")?.textContent).toBe(text);
  expect(root.querySelector("em, script")).toBeNull();
});
