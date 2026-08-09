import type {SEO} from "@ayu-sh-kr/dota-wrap/core";
import type {NavigationContext} from "@ayu-sh-kr/dota-wrap/router";
import {getBlogSlug} from "@app/configs/blogs.config.ts";
import {getShowcaseSlug} from "@app/data/showcase-content.ts";
import type {PageSeoContent} from "@app/data/seo-content.ts";
import type {AnalyticsPage} from "@app/events/analytics.events.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

const SITE_ORIGIN = "https://www.ayu-sh-kr.com";

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
  favicon: "/favicon.svg",
  og: {
    title: content.ogTitle,
    description: content.ogDescription,
  },
});

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
 * canonical link or `og:url`, so this route hook fills that gap using the
 * committed URL. It also publishes the single GA4 `page_view` for the completed
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
