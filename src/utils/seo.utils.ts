import type {SEO} from "@ayu-sh-kr/dota-wrap/core";
import type {NavigationContext} from "@ayu-sh-kr/dota-wrap/router";
import {getBlogPath, getBlogPost, getBlogSlug, type BlogPost} from "@app/configs/blogs.config.ts";
import {getNewsSlug} from "@app/configs/news.config.ts";
import {getShowcaseSlug} from "@app/data/showcase-content.ts";
import {siteIdentity} from "@app/data/portfolio-content.ts";
import type {PageSeoContent} from "@app/data/seo-content.ts";
import type {AnalyticsPage} from "@app/events/analytics.events.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

const SITE_ORIGIN = "https://www.ayu-sh-kr.com";
/** Canonical about page used as the `author.url` of every article. */
const AUTHOR_URL = `${SITE_ORIGIN}/card/about-me/`;
/** ID of the route-owned JSON-LD script, replaced or removed on every navigation. */
const ROUTE_STRUCTURED_DATA_ID = "route-structured-data";

type Gtag = (
  command: string,
  target: string | Date,
  parameters?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

/**
 * Converts framework-neutral data into the Dota page SEO contract.
 *
 * Keeping this mapping in one place lets page classes expose a simple `seo`
 * getter while preserving a data-only source of truth for authored metadata.
 */
export const toSEO = (content: PageSeoContent): SEO => ({
  title: content.title,
  description: content.description,
  keywords: [...content.keywords],
  favicon: "/icons/svg/maskable-brand.svg",
  og: {
    title: content.ogTitle,
    description: content.ogDescription,
  },
});

/**
 * Builds schema.org `BlogPosting` structured data for one catalog post.
 *
 * Every field comes from the authored catalog entry, so the markup always matches
 * the visible headline, summary, author and dates. `dateModified` falls back to the
 * publication date for posts that have never been revised. The catalog has no cover
 * images, so `image` is omitted rather than pointing at an unrelated asset.
 *
 * @param post - Catalog record of the article being rendered.
 * @returns A JSON-serializable `BlogPosting` object with the canonical URL as `mainEntityOfPage`.
 */
export const toBlogPostingStructuredData = (post: BlogPost): Record<string, unknown> => {
  const canonicalUrl = new URL(getBlogPath(post.slug), SITE_ORIGIN).href;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.header,
    description: post.description,
    author: {
      "@type": "Person",
      name: siteIdentity.fullName,
      url: AUTHOR_URL,
    },
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
    keywords: post.keywords.join(", "),
  };
};

/**
 * Writes or removes the route-owned JSON-LD script for the committed pathname.
 *
 * Blog article routes receive a `BlogPosting` from {@link toBlogPostingStructuredData};
 * every other route removes the script so a client-side navigation away from an
 * article does not leave stale article markup behind. The site-wide `Person` JSON-LD
 * in `index.html` is a separate script and is never touched. `<` is escaped so authored
 * text cannot close the script element.
 *
 * @param pathname - Browser pathname after the router has committed navigation.
 */
const applyStructuredData = (pathname: string): void => {
  const existing = document.getElementById(ROUTE_STRUCTURED_DATA_ID);
  const post = pathname.startsWith("/blog/") ? getBlogPost(getBlogSlug(pathname)) : undefined;
  if (!post) {
    existing?.remove();
    return;
  }

  const script = existing ?? document.head.appendChild(document.createElement("script"));
  script.id = ROUTE_STRUCTURED_DATA_ID;
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(toBlogPostingStructuredData(post)).replace(/</g, "\\u003c");
};

/**
 * Classifies a completed pathname for the page-view event.
 *
 * Route titles can change with authored content, so analytics uses stable page
 * categories instead. Blog and showcase detail routes also retain their
 * decoded slug for content-level reporting.
 *
 * @param pathname - Browser pathname after the router has committed navigation.
 * @returns Stable page identity and the optional content slug.
 */
const getAnalyticsPage = (pathname: string): {page: AnalyticsPage; slug?: string} => {
  if (pathname === "/") {
    return {page: "home"};
  }
  if (pathname === "/pricing") {
    return {page: "pricing"};
  }
  if (pathname === "/coffee") {
    return {page: "coffee"};
  }
  if (pathname === "/support") {
    return {page: "support"};
  }
  if (pathname === "/blog") {
    return {page: "blog"};
  }
  if (pathname.startsWith("/blog/")) {
    return {page: "blog_article", slug: getBlogSlug(pathname)};
  }
  if (pathname === "/news") {
    return {page: "news"};
  }
  if (pathname.startsWith("/news/")) {
    return {page: "news_article", slug: getNewsSlug(pathname)};
  }
  if (pathname === "/showcase") {
    return {page: "showcase"};
  }
  if (pathname.startsWith("/showcase/")) {
    return {page: "showcase_article", slug: getShowcaseSlug(pathname)};
  }
  if (pathname === "/legal/terms") {
    return {page: "terms"};
  }
  if (pathname === "/legal/privacy") {
    return {page: "privacy"};
  }
  if (pathname === "/offline") {
    return {page: "offline"};
  }

  return {page: "error"};
};

/**
 * Synchronizes route metadata after the router has rendered a page.
 *
 * `DotaPageElement` updates the title, description, keywords, and Open Graph
 * copy during page initialization. The framework SEO contract does not own the
 * canonical link, `og:url` or article structured data, so this route hook
 * fills that gap using the committed URL. It also publishes the single GA4 `page_view` for the completed
 * route; `index.html` disables the automatic config page view to avoid sending
 * an early hit with the previous page title.
 *
 * Register this function in `initializeApp({globalHooks: {afterEach: [...]}})`.
 * The global hook runs after rendering, so `document.title` already belongs to
 * the destination page when the analytics event is queued. Keeping registration
 * at application startup also covers dynamic route parameter changes uniformly.
 *
 * @param context - Completed route context supplied by the Dota router.
 */
export const applyRouteMetadata = (context: NavigationContext): void => {
  const canonicalPath = context.url.pathname === "/" || context.url.pathname.endsWith("/")
    ? context.url.pathname
    : `${context.url.pathname}/`;
  const canonicalUrl = new URL(canonicalPath, SITE_ORIGIN).href;
  const canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?? document.head.appendChild(document.createElement("link"));
  canonicalLink.rel = "canonical";
  canonicalLink.href = canonicalUrl;

  const ogUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    ?? document.head.appendChild(document.createElement("meta"));
  ogUrl.setAttribute("property", "og:url");
  ogUrl.content = canonicalUrl;
  applyStructuredData(context.url.pathname);

  const analyticsPage = getAnalyticsPage(context.url.pathname);
  publishAnalyticsEvent({
    eventName: "page_view",
    params: {
      page: analyticsPage.page,
      page_path: context.url.pathname,
      ...(analyticsPage.slug ? {slug: analyticsPage.slug} : {}),
    },
  });
};
