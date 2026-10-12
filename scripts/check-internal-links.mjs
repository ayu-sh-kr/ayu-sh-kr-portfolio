#!/usr/bin/env node
import {existsSync, readdirSync, readFileSync, statSync} from "node:fs";
import {join, relative, resolve} from "node:path";
import {fileURLToPath} from "node:url";

/** Canonical origin for every public page: HTTPS, the `www` host, and trailing-slash page paths. */
export const SITE_ORIGIN = "https://www.ayu-sh-kr.com";

const SITE_HOSTS = new Set(["ayu-sh-kr.com", "www.ayu-sh-kr.com"]);
const ABSOLUTE_SITE_URL = /(?:https?:)?\/\/(?:www\.)?ayu-sh-kr\.com(?![\w.-])[^\s"'<>)\]`\\]*/g;
const ANCHOR_HREF = /<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gis;
const CRAWLED_EXTENSIONS = [".html", ".xml", ".txt"];

/**
 * Classifies one href as written in HTML, Markdown, or a text file.
 *
 * The site has a single canonical URL shape, `https://www.ayu-sh-kr.com/<path>/`.
 * Root-relative links are accepted when their page path ends in `/`; paths whose
 * last segment has a file extension are assets and keep their file name. External
 * hosts, `mailto:`, `tel:`, and same-page `#fragment` links are ignored.
 *
 * Used by the post-build crawl below and by the Vitest source checks, so both
 * apply exactly the same rule.
 *
 * @param href - Raw attribute or Markdown link destination, with HTML entities already decoded.
 * @returns `null` for links outside the site; otherwise the site path, whether it is an
 *          asset, and the canonical-form violation when one exists.
 */
export const classifyHref = (href) => {
  const value = href.trim();
  if (!value || value.startsWith("#") || /^(mailto|tel|javascript|data):/i.test(value)) {
    return null;
  }

  let url;
  let violation = null;
  if (value.startsWith("/") && !value.startsWith("//")) {
    url = new URL(value, SITE_ORIGIN);
  } else {
    try {
      url = new URL(value.startsWith("//") ? `https:${value}` : value);
    } catch {
      return null;
    }
    if (!SITE_HOSTS.has(url.hostname)) {
      return null;
    }
    if (value.startsWith("http://")) {
      violation = "uses http:// instead of https://";
    } else if (value.startsWith("//")) {
      violation = "protocol-relative URL; use https://www.";
    } else if (url.hostname !== "www.ayu-sh-kr.com") {
      violation = "uses ayu-sh-kr.com without www";
    }
  }

  const path = url.pathname;
  const lastSegment = path.slice(path.lastIndexOf("/") + 1);
  const isAsset = /\.[a-z0-9]+$/i.test(lastSegment);
  if (!violation && !isAsset && !path.endsWith("/")) {
    violation = "page path is missing its trailing slash";
  }

  return {path, isAsset, violation};
};

/**
 * Extracts link destinations from Markdown, ignoring fenced code blocks and inline code.
 *
 * Code samples in articles legitimately contain example paths, so only links a
 * reader can follow are returned. Inline links, images, autolinks, reference
 * definitions, raw `<a>` tags, and front matter `href:` fields are all collected.
 *
 * @param markdown - Raw Markdown article body.
 * @returns Every link destination with its 1-based source line.
 */
export const extractMarkdownLinks = (markdown) => {
  const links = [];
  let fence = null;
  markdown.split("\n").forEach((line, index) => {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) {
        fence = marker;
      } else if (fence === marker) {
        fence = null;
      }
      return;
    }
    if (fence !== null) {
      return;
    }

    const prose = line.replace(/`[^`]*`/g, "");
    for (const match of prose.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
      links.push({href: match[1], line: index + 1});
    }
    for (const match of prose.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/g)) {
      links.push({href: match[1], line: index + 1});
    }
    for (const match of prose.matchAll(/<(https?:\/\/[^>\s]+)>/g)) {
      links.push({href: match[1], line: index + 1});
    }
    for (const match of prose.matchAll(/<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gi)) {
      links.push({href: match[2], line: index + 1});
    }
    // Front matter link lists, such as the legal pages' `related` entries.
    for (const match of prose.matchAll(/\bhref:\s*["']?(\/[^,\s}"']*)/g)) {
      links.push({href: match[1], line: index + 1});
    }
  });

  return links;
};

/** Decodes the few HTML entities that appear inside generated href attributes. */
const decodeEntities = (value) => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, "\"")
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

/** Recursively lists crawlable build files (HTML documents, sitemap, and text indexes). */
const listFiles = (directory) => readdirSync(directory).flatMap((entry) => {
  const file = join(directory, entry);
  if (statSync(file).isDirectory()) {
    return listFiles(file);
  }
  return CRAWLED_EXTENSIONS.some((extension) => file.endsWith(extension)) ? [file] : [];
});

/**
 * Resolves whether a site path is served by the static build without a redirect.
 *
 * Page paths must map to a generated `index.html`; asset paths must exist as files.
 * Client-only routes have no generated document, so they are reported as missing
 * and need either SSG registration or removal from crawlable markup.
 */
const existsInBuild = (outputDirectory, path, isAsset) => {
  const target = resolve(outputDirectory, `.${decodeURIComponent(path)}`);
  if (!target.startsWith(outputDirectory)) {
    return false;
  }
  return isAsset ? existsSync(target) : existsSync(join(target, "index.html"));
};

/**
 * Crawls a static build and reports every non-canonical or unresolved internal URL.
 *
 * Every `<a href>` in generated HTML is classified with {@link classifyHref}. Absolute
 * site URLs anywhere in HTML, `sitemap.xml`, and `llms.txt` (canonical tags, `og:url`,
 * JSON-LD, plain-text indexes) are checked the same way. A canonical link whose target
 * has no generated document or asset is reported as a 404 risk.
 *
 * @param outputDirectory - Absolute path of the SSG output directory, normally `dist`.
 * @returns Human-readable problems, plus the number of files and links checked.
 */
export const crawlBuild = (outputDirectory) => {
  const problems = [];
  let linkCount = 0;

  for (const file of listFiles(outputDirectory)) {
    const text = readFileSync(file, "utf8");
    const source = relative(outputDirectory, file);
    const hrefs = file.endsWith(".html")
      ? [...text.matchAll(ANCHOR_HREF)].map((match) => decodeEntities(match[2]))
      : [];
    const absoluteUrls = [...text.matchAll(ABSOLUTE_SITE_URL)].map((match) => decodeEntities(match[0]));

    for (const href of new Set([...hrefs, ...absoluteUrls])) {
      const result = classifyHref(href);
      if (!result) {
        continue;
      }
      linkCount += 1;
      if (result.violation) {
        problems.push(`${source}: ${href} — ${result.violation}`);
      } else if (!existsInBuild(outputDirectory, result.path, result.isAsset)) {
        problems.push(`${source}: ${href} — no generated document or file (404 or client-only route)`);
      }
    }
  }

  return {problems, linkCount};
};

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const outputDirectory = resolve(process.argv[2] ?? "dist");
  if (!existsSync(outputDirectory)) {
    console.error(`Build output not found: ${outputDirectory}. Run the SSG build first.`);
    process.exit(1);
  }

  const {problems, linkCount} = crawlBuild(outputDirectory);
  if (problems.length > 0) {
    console.error(`Internal link check failed: ${problems.length} problem(s) in ${linkCount} checked link(s).`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
  }
  console.log(`Internal link check passed: ${linkCount} internal link(s) canonical and resolvable.`);
}
