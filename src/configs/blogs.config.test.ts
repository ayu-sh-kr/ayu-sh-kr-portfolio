import {describe, expect, it} from "vitest";
import {blogPosts, getBlogPath, getBlogPost, getRelatedBlogPosts, type BlogPost} from "@app/configs/blogs.config.ts";

/** Builds a minimal catalog record for ranking tests. */
const post = (slug: string, tags: string[], date: string, category: BlogPost["category"] = "tutorial"): BlogPost => ({
  slug, tags, date, category, writer: "A", header: slug, description: "", keywords: [], source: "", minutes: 1,
});

describe("blog catalog", () => {
  it("builds canonical trailing-slash article paths", () => {
    expect(getBlogPath("postgresql-access-control")).toBe("/blog/postgresql-access-control/");
  });

  it("ranks related posts by shared tags, then category, then recency, excluding the post itself", () => {
    const current = post("current", ["postgresql", "security"], "2026-01-01");
    const catalog = [
      current,
      post("one-tag-old", ["postgresql"], "2025-01-01"),
      post("two-tags", ["postgresql", "security"], "2024-01-01"),
      post("one-tag-new", ["security"], "2026-02-01"),
      post("one-tag-other-category", ["security"], "2026-03-01", "rant"),
      post("unrelated", ["redis"], "2026-04-01"),
    ];

    expect(getRelatedBlogPosts(current, catalog).map((item) => item.slug))
      .toEqual(["two-tags", "one-tag-new", "one-tag-old", "one-tag-other-category"]);
  });

  it("fills up to two related posts from the same category when tags find fewer", () => {
    const current = post("current", ["frontend"], "2026-01-01");
    const catalog = [
      current,
      post("shared", ["frontend"], "2025-01-01"),
      post("same-category", ["ai"], "2026-02-01"),
      post("other-category", ["ai"], "2026-03-01", "rant"),
    ];

    expect(getRelatedBlogPosts(current, catalog).map((item) => item.slug)).toEqual(["shared", "same-category"]);
  });

  it("gives every published post two to four related posts", () => {
    for (const item of blogPosts) {
      const related = getRelatedBlogPosts(item);
      expect(related.length, item.slug).toBeGreaterThanOrEqual(2);
      expect(related.length, item.slug).toBeLessThanOrEqual(4);
      expect(related.map((entry) => entry.slug), item.slug).not.toContain(item.slug);
    }
  });

  it("relates the PostgreSQL permissions guide to authorization and database posts", () => {
    const related = getRelatedBlogPosts(getBlogPost("postgresql-access-control")!).map((item) => item.slug);
    expect(related).toContain("business-logic-auth-middleware");
    expect(related).toContain("distributed-locks-redis");
  });
});
