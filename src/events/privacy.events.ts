/** Published by the privacy view with normalized Markdown for its child viewer. */
export const PRIVACY_MARKDOWN_SOURCE_EVENT = "privacy:markdown-source";
/** Published after privacy Markdown is rendered and headings are decorated. */
export const PRIVACY_MARKDOWN_RENDER_EVENT = "privacy:markdown-render";

/** Metadata used by the privacy Markdown view and grouped TOC. */
export type PrivacySection = {
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

/** Payload sent from the privacy loader view to the Markdown viewer. */
export type PrivacyMarkdownSource = {
  /** Frontmatter-free policy Markdown body. */
  markdown: string;
  /** Section metadata extracted from the authored policy headings. */
  sections: readonly PrivacySection[];
};

/** Payload sent after privacy Markdown is decorated for the TOC and progress UI. */
export type PrivacyMarkdownRender = {
  /** Sections available for navigation and progress calculations. */
  sections: readonly PrivacySection[];
};
