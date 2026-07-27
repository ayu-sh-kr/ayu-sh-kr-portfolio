import type {SEO} from "@ayu-sh-kr/dota-wrap/core";
import type {NavigationContext} from "@ayu-sh-kr/dota-wrap/router";
import type {PageSeoContent} from "@app/data/seo-content.ts";

const SITE_ORIGIN = "https://ayu-sh-kr.com";

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
  og: {
    title: content.ogTitle,
    description: content.ogDescription,
  },
});

/**
 * Synchronizes route metadata after the router has rendered a page.
 *
 * `DotaPageElement` updates the title, description, keywords, and Open Graph
 * copy during page initialization. The framework SEO contract does not own the
 * canonical link or `og:url`, so this route hook fills that gap using the
 * committed URL. It also sends the single GA4 `page_view` for the completed
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
  const canonicalUrl = new URL(context.url.pathname, SITE_ORIGIN).href;
  const canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?? document.head.appendChild(document.createElement("link"));
  canonicalLink.rel = "canonical";
  canonicalLink.href = canonicalUrl;

  const ogUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    ?? document.head.appendChild(document.createElement("meta"));
  ogUrl.setAttribute("property", "og:url");
  ogUrl.content = canonicalUrl;

  window.gtag?.("event", "page_view", {
    page_title: document.title,
    page_location: context.url.href,
  });
};
