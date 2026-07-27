/**
 * Framework-neutral SEO content authored by the data layer.
 *
 * Page classes consume this shape through `toSEO()`, which keeps titles,
 * descriptions, keywords, and Open Graph copy out of route composition code.
 */
export interface PageSeoContent {
  /** Document title shown in the browser tab and search result title. */
  title: string;
  /** Search description summarizing the current page. */
  description: string;
  /** Search terms associated with the page and its audience. */
  keywords: readonly string[];
  /** Open Graph title used when the page is shared. */
  ogTitle: string;
  /** Open Graph description used when the page is shared. */
  ogDescription: string;
}
