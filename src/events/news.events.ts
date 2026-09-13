/** Published with the loaded Markdown body for the active Dispatch note. */
export const NEWS_MARKDOWN_SOURCE_EVENT = "news:markdown-source";

/** Document payload consumed only by the news Markdown view. */
export type NewsMarkdownSource = {
  /** Raw Markdown returned from the note's configured public document. */
  markdown: string;
};
