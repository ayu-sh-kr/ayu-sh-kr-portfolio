import type {BlogPost} from "@app/configs/blogs.config.ts";

export const BLOG_INDEX_DATA_EVENT = "blog:index-data";
export const BLOG_ARTICLE_DATA_EVENT = "blog:article-data";
export const BLOG_ARTICLE_ERROR_EVENT = "blog:article-error";
export const BLOG_MARKDOWN_SOURCE_EVENT = "blog:markdown-source";

export type BlogIndexData = {
  posts: readonly BlogPost[];
};

export type BlogArticleData = {
  post: BlogPost | null;
  nextPost: BlogPost | null;
};

export type BlogArticleError = {
  message: string;
};

export type BlogMarkdownSource = {
  markdown: string;
};
