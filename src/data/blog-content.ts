import {siteIdentity} from "@app/data/portfolio-content.ts";
import type {BlogPost} from "@app/configs/blogs.config.ts";
import type {PageSeoContent} from "@app/data/seo-content.ts";

/**
 * Filter option rendered by the blog index and mirrored in its URL hash.
 *
 * The value is consumed by filter-aware children, the label is presentation copy,
 * and the hash is the stable browser URL representation.
 */
export type BlogFilterOption = {
  /** Category value sent through the filter event bus; `all` clears filtering. */
  value: BlogPost["category"] | "all";
  /** Human-readable label shown on the filter control. */
  label: string;
  /** Hash fragment used to restore the selected filter. */
  hash: string;
};

/** Stable filter choices shared by the filter component and hash parsing. */
export const blogFilters: readonly BlogFilterOption[] = [
  {value: "all", label: "All", hash: "all"},
  {value: "tutorial", label: "Tutorials", hash: "tutorials"},
  {value: "rant", label: "Rants", hash: "rants"},
  {value: "news", label: "News", hash: "news"},
  {value: "notes", label: "Notes", hash: "notes"},
];

/**
 * Authored copy for the blog index sections.
 *
 * Components read this object for visible text and accessible labels; layout,
 * event wiring, and post data remain in their respective component boundaries.
 */
export const blogIndexContent = {
  hero: {
    eyebrow: "The blog",
    titleBeforeAccent: "Tutorials, takes, and the occasional",
    titleAccent: "rant.",
    summary: "Notes from running a production backend solo — what works, what broke, and what I think about it.",
    scrollHint: "Scroll",
  },
  filter: {
    ariaLabel: "Filter blog posts",
    postLabel: "post",
    postsLabel: "posts",
  },
  readTimeSuffix: "min read",
  highlighted: {
    ariaLabel: "Featured post",
    readLabel: "Read",
  },
  list: {
    ariaLabel: "All posts",
    loading: "Loading posts…",
    emptyPrefix: "Nothing here yet. The",
    emptySuffix: "posts are brewing.",
    resetLabel: "Show everything",
  },
  listSection: {
    ariaLabel: "Browse blog posts",
  },
  subscription: {
    ariaLabel: "Subscribe",
    title: "New posts, no noise.",
    copy: "Occasional emails when something ships.",
    formAction: "mailto:akjaiswal2003@gmail.com",
    emailLabel: "Email address",
    emailPlaceholder: "name@company.com",
    submitLabel: "Subscribe",
  },
} as const;

/**
 * Authored copy for article states, metadata, navigation, and Markdown controls.
 *
 * `blog-article` owns the route shell and reads these values while
 * `blog-markdown-view` uses the nested copy-button labels.
 */
export const blogArticleContent = {
  allPostsLabel: "All posts",
  loadingPost: "Loading post…",
  notFound: {
    eyebrow: "404",
    title: "That post is not here.",
    browseLabel: "Browse the blog",
  },
  loadingArticle: "Loading the post…",
  loadError: "This post could not be loaded right now.",
  returnToPostsLabel: "Return to all posts",
  authorPrefix: "Written by",
  footer: {
    shareCopy: "Share the useful parts.",
    backLabel: "Back to",
    nextLabel: "Next note",
  },
  markdown: {
    copyLabel: "Copy",
    copiedLabel: "Copied",
  },
} as const;

/** Shared search terms for the blog index and article pages. */
const blogKeywords = [siteIdentity.name, "Backend Engineering", "Kotlin", "Spring Boot", "AWS", "Redis", "Blog"] as const;

/**
 * Builds SEO content for the blog index or one selected blog article.
 *
 * Article copy comes from the authored `BlogPost`; shared keywords and fallback
 * text remain here, so route classes only resolve the current slug and adapt the
 * returned data to the page SEO contract.
 */
export const getBlogSeo = (post?: Pick<BlogPost, "header" | "description">): PageSeoContent => {
  const title = post ? `${post.header} — ${siteIdentity.domain}` : `The blog — ${siteIdentity.domain}`;
  const description = post?.description ?? "Tutorials, takes, and notes from running production backends solo.";

  return {
    title,
    description,
    keywords: blogKeywords,
    ogTitle: title,
    ogDescription: description,
  };
};

/** SEO fallback used when a blog slug does not match an authored post. */
export const blogNotFoundSeo: PageSeoContent = {
  title: `Post not found — ${siteIdentity.domain}`,
  description: "The requested blog post could not be found.",
  keywords: blogKeywords,
  ogTitle: `Post not found — ${siteIdentity.domain}`,
  ogDescription: "The requested blog post could not be found.",
};
