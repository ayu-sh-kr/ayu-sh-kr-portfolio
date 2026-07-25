export const PRIVACY_MARKDOWN_SOURCE_EVENT = "privacy:markdown-source";
export const PRIVACY_MARKDOWN_RENDER_EVENT = "privacy:markdown-render";

export type PrivacySection = {
  id: string;
  title: string;
  scope: string;
  group: string;
  short: string;
};

export type PrivacyMarkdownSource = {
  markdown: string;
  sections: readonly PrivacySection[];
};

export type PrivacyMarkdownRender = {
  sections: readonly PrivacySection[];
};
