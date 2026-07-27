/**
 * Application event carrying the Markdown body for the currently selected
 * showcase case study from `showcase-view` to `showcase-markdown-view`.
 */
export const SHOWCASE_MARKDOWN_SOURCE_EVENT = "showcase:markdown-source";

/** Payload published with {@link SHOWCASE_MARKDOWN_SOURCE_EVENT}. */
export type ShowcaseMarkdownSource = {
  /** Frontmatter-free Markdown body ready for the shared Markdown renderer. */
  markdown: string;
};
