export const TERMS_MARKDOWN_SOURCE_EVENT = "terms:markdown-source";
export const TERMS_MARKDOWN_RENDER_EVENT = "terms:markdown-render";

export type TermsSection = {
  id: string;
  title: string;
  scope: string;
  group: string;
  short: string;
};

export type TermsMarkdownSource = {
  markdown: string;
  sections: readonly TermsSection[];
};

export type TermsMarkdownRender = {
  sections: readonly TermsSection[];
};