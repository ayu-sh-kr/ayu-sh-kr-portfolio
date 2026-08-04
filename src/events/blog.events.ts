import type {BlogPost} from "@app/configs/blogs.config.ts";

/** Published by the blog data coordinator with every post used by the index children. */
export const BLOG_INDEX_DATA_EVENT = "blog:index-data";

/** Published when the index filter changes so list-oriented children can update independently. */
export const BLOG_FILTER_CHANGE_EVENT = "blog:filter-change";

/** Published with the loaded Markdown body for the active article's Markdown child. */
export const BLOG_MARKDOWN_SOURCE_EVENT = "blog:markdown-source";

/** Payload sent to index children so each child can render from the same catalog snapshot. */
export type BlogIndexData = {
  /** Newest-first catalog snapshot consumed by the index filter, highlight, and archive. */
  posts: readonly BlogPost[];
};

/** Payload sent to filter-aware index children when the selected category changes. */
export type BlogFilterChange = {
  /** Selected category; `all` removes category filtering. */
  filter: BlogPost["category"] | "all";
};

/** Loaded Markdown payload consumed by `blog-markdown-view`. */
export type BlogMarkdownSource = {
  /** Markdown body returned by the selected post's source URL. */
  markdown: string;
};
