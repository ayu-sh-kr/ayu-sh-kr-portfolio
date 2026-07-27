/** Published by the terms view with normalized Markdown for its child viewer. */
export const TERMS_MARKDOWN_SOURCE_EVENT = "terms:markdown-source";
/** Published after terms Markdown is rendered and headings are decorated. */
export const TERMS_MARKDOWN_RENDER_EVENT = "terms:markdown-render";

/** Metadata used by the terms Markdown view and grouped TOC. */
export type TermsSection = {
  /** Stable heading ID used for hashes and progress tracking. */
  id: string;
  /** Full heading text shown in anchors and section labels. */
  title: string;
  /** Audience scope rendered as the section chip. */
  scope: string;
  /** Group label used to organize TOC entries. */
  group: string;
  /** Short navigation label shown in the TOC. */
  short: string;
};

/** Payload sent from the terms loader view to the Markdown viewer. */
export type TermsMarkdownSource = {
  /** Frontmatter-free terms Markdown body. */
  markdown: string;
  /** Section metadata extracted from the authored terms headings. */
  sections: readonly TermsSection[];
};

/** Payload sent after terms Markdown is decorated for the TOC and progress UI. */
export type TermsMarkdownRender = {
  /** Sections available for navigation and progress calculations. */
  sections: readonly TermsSection[];
};
