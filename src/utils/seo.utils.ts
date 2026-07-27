import type {SEO} from "@ayu-sh-kr/dota-wrap/core";
import type {PageSeoContent} from "@app/data/seo-content.ts";

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
