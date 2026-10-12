import {readdirSync, readFileSync, statSync} from "node:fs";
import {join, relative} from "node:path";
import {describe, expect, it} from "vitest";
import {classifyHref, extractMarkdownLinks} from "../scripts/check-internal-links.mjs";

const ROOT = join(import.meta.dirname, "..");

/** Lists files below a repository directory whose names end with one of the given suffixes. */
const listFiles = (directory: string, suffixes: readonly string[]): string[] =>
  readdirSync(join(ROOT, directory)).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(join(ROOT, path)).isDirectory()) {
      return listFiles(path, suffixes);
    }
    return suffixes.some((suffix) => path.endsWith(suffix)) ? [path] : [];
  });

/** Formats each non-canonical link as `file:line href — reason` so failures point at the source. */
const findViolations = (links: readonly {file: string; line: number; href: string}[]): string[] =>
  links.flatMap(({file, line, href}) => {
    const violation = classifyHref(href)?.violation;
    return violation ? [`${file}:${line} ${href} — ${violation}`] : [];
  });

/** Returns the 1-based line number of a character offset. */
const lineAt = (text: string, offset: number): number => text.slice(0, offset).split("\n").length;

describe("internal link canonical form", () => {
  it("accepts canonical page links, fragments on canonical pages, assets, and external hosts", () => {
    expect(classifyHref("/blog/distributed-locks-redis/")?.violation).toBeNull();
    expect(classifyHref("/legal/privacy/#cookies")?.violation).toBeNull();
    expect(classifyHref("/")?.violation).toBeNull();
    expect(classifyHref("/#contact")?.violation).toBeNull();
    expect(classifyHref("https://www.ayu-sh-kr.com/blog/")?.violation).toBeNull();
    expect(classifyHref("/blogs/tutorial/assets/postgresql-access-control/query-access.svg")?.violation).toBeNull();
    expect(classifyHref("https://www.ayu-sh-kr.com/sitemap.xml")?.violation).toBeNull();
    expect(classifyHref("https://www.postgresql.org/docs/18/sql-grant.html")).toBeNull();
    expect(classifyHref("mailto:hello@ayu-sh-kr.com")).toBeNull();
    expect(classifyHref("#quick-fixes")).toBeNull();
  });

  it("rejects missing trailing slashes, the bare domain, and http", () => {
    expect(classifyHref("/blog/distributed-locks-redis")?.violation).toMatch(/trailing slash/);
    expect(classifyHref("/legal/privacy#cookies")?.violation).toMatch(/trailing slash/);
    expect(classifyHref("https://ayu-sh-kr.com/blog/")?.violation).toMatch(/without www/);
    expect(classifyHref("http://www.ayu-sh-kr.com/blog/")?.violation).toMatch(/http:\/\//);
    expect(classifyHref("//ayu-sh-kr.com/blog/")?.violation).toMatch(/protocol-relative/);
  });

  it("collects front matter href fields", () => {
    const markdown = "---\nrelated:\n  - { title: Terms, href: /legal/terms, blurb: \"x\" }\n---\n";
    expect(extractMarkdownLinks(markdown).map((link) => link.href)).toEqual(["/legal/terms"]);
  });

  it("ignores example paths inside Markdown code", () => {
    const markdown = "See [locks](/blog/distributed-locks-redis/).\n\n```md\n[example](/events/app-opened)\n```\n\nUse `[x](/nope)` inline.";
    expect(extractMarkdownLinks(markdown).map((link) => link.href)).toEqual(["/blog/distributed-locks-redis/"]);
  });

  it("keeps every Markdown article and legal page link canonical", () => {
    const links = listFiles("public", [".md"]).flatMap((file) =>
      extractMarkdownLinks(readFileSync(join(ROOT, file), "utf8")).map((link) => ({file, ...link})));

    expect(findViolations(links)).toEqual([]);
  });

  it("keeps hrefs authored in components, pages, and content modules canonical", () => {
    // Matches a quoted root-relative or absolute site URL assigned to an href-like attribute or field.
    const hrefPattern = /\b(?:href|[a-z]+Href)\s*(?:=|:)\s*["'`]((?:\/|https?:\/\/(?:www\.)?ayu-sh-kr\.com)[^"'`\s]*)["'`]/g;
    const links = listFiles("src", [".ts"])
      .filter((file) => !file.endsWith(".test.ts"))
      .flatMap((file) => {
        const text = readFileSync(join(ROOT, file), "utf8");
        return [...text.matchAll(hrefPattern)].map((match) => ({
          file: relative(ROOT, join(ROOT, file)),
          line: lineAt(text, match.index),
          href: match[1].replace(/\$\{[^}]+\}/g, "slug"),
        }));
      });

    expect(links.length).toBeGreaterThan(50);
    expect(findViolations(links)).toEqual([]);
  });

  it("keeps absolute site URLs in public text indexes and sitemap canonical", () => {
    const absoluteUrl = /(?:https?:)?\/\/(?:www\.)?ayu-sh-kr\.com(?![\w.-])[^\s"'<>)\]`]*/g;
    const links = ["public/sitemap.xml", "public/llms.txt", "public/robots.txt", "index.html"].flatMap((file) => {
      const text = readFileSync(join(ROOT, file), "utf8");
      return [...text.matchAll(absoluteUrl)].map((match) => ({file, line: lineAt(text, match.index), href: match[0]}));
    });

    expect(findViolations(links)).toEqual([]);
  });
});
