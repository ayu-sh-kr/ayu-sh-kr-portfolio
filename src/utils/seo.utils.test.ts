import {afterEach, describe, expect, it} from "vitest";
import type {NavigationContext} from "@ayu-sh-kr/dota-wrap/router";
import {blogPosts, getBlogPost} from "@app/configs/blogs.config.ts";
import {applyRouteMetadata, toBlogPostingStructuredData} from "@app/utils/seo.utils.ts";

/** Builds the minimal completed-navigation context read by `applyRouteMetadata`. */
const navigateTo = (pathname: string): void =>
  applyRouteMetadata({url: new URL(pathname, "https://www.ayu-sh-kr.com")} as unknown as NavigationContext);

/** Reads and parses the route-owned JSON-LD script, or `null` when it is absent. */
const routeStructuredData = (): Record<string, unknown> | null => {
  const script = document.getElementById("route-structured-data");
  return script ? JSON.parse(script.textContent ?? "") as Record<string, unknown> : null;
};

describe("blog structured data", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("describes every blog post with the fields schema.org BlogPosting needs", () => {
    for (const post of blogPosts) {
      const data = toBlogPostingStructuredData(post);
      expect(data, post.slug).toMatchObject({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.header,
        description: post.description,
        author: {"@type": "Person", name: "Ayush Kumar Jaiswal", url: "https://www.ayu-sh-kr.com/card/about-me/"},
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        mainEntityOfPage: {"@type": "WebPage", "@id": `https://www.ayu-sh-kr.com/blog/${post.slug}/`},
      });
      expect(String(data.headline).length, post.slug).toBeLessThanOrEqual(110);
      expect(Date.parse(String(data.dateModified)), post.slug).toBeGreaterThanOrEqual(Date.parse(String(data.datePublished)));
    }
  });

  it("uses the revision date as dateModified for the PostgreSQL guide", () => {
    expect(toBlogPostingStructuredData(getBlogPost("postgresql-access-control")!).dateModified).toBe("2026-10-12");
  });

  it("writes JSON-LD on article routes and removes it on other routes", () => {
    navigateTo("/blog/postgresql-access-control/");
    expect(routeStructuredData()?.headline).toBe(getBlogPost("postgresql-access-control")!.header);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href"))
      .toBe("https://www.ayu-sh-kr.com/blog/postgresql-access-control/");

    navigateTo("/blog/");
    expect(routeStructuredData()).toBeNull();
  });
});
