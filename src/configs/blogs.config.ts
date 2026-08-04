import {siteIdentity} from "@app/data/portfolio-content.ts";

/** Editorial category used by index filters, post metadata, and URL hashes. */
export type BlogCategory = "tutorial" | "rant" | "news" | "notes";

/**
 * Authored metadata for one blog post.
 *
 * The catalog is the source of truth for the index cards, article metadata,
 * navigation, SEO, and the Markdown source requested by `BlogLoaderService`.
 */
export type BlogPost = {
  /** Stable URL slug used by the dynamic article route. */
  slug: string;
  /** ISO calendar date shown in the index and article metadata. */
  date: string;
  /** Author name shown below the article title. */
  writer: string;
  /** Published headline used across the index, article, and next-post link. */
  header: string;
  /** Short summary used for index discovery and article SEO description. */
  description: string;
  /** Filter category shown beside the post metadata. */
  category: BlogCategory;
  /** Root-relative URL for the Markdown source in `public/blogs`. */
  source: string;
  /** Estimated reading time in minutes. */
  minutes: number;
};

/**
 * Authored blog catalog used by article routes and index-derived views.
 *
 * Posts do not need a manual featured flag or display order. The index uses
 * {@link getBlogPostsForIndex} and {@link getLatestBlogPost} below to derive
 * both from each post's ISO `date`.
 */
export const blogPosts: readonly BlogPost[] = [
  {
    slug: "aws-app-config-spring-boot-integration",
    date: "2026-08-04",
    writer: siteIdentity.name,
    header: "AWS AppConfig Spring Boot Integration",
    description:
      "Loading and refreshing AWS AppConfig in Spring Boot, including Config Data, AppConfig Agent, Spring Cloud, and immutable Kotlin properties.",
    category: "tutorial",
    source: "/blogs/tutorial/Aws-App-Config-Spring-Boot-Integration.md",
    minutes: 14,
  },
  {
    slug: "postgresql-access-control",
    date: "2026-08-02",
    writer: siteIdentity.name,
    header: "PostgreSQL access control: roles and permissions that make sense",
    description:
      "A practical, plain-language guide to PostgreSQL roles, privileges, ownership, default grants, and row-level security.",
    category: "tutorial",
    source: "/blogs/tutorial/Postgres-Access-Control.md",
    minutes: 12,
  },
  {
    slug: "distributed-locks-redis",
    date: "2026-07-12",
    writer: siteIdentity.name,
    header: "Distributed locks in Redis, without the folklore",
    description:
      "Everyone copies the same SETNX snippet. Here is what actually matters when a lock is guarding real money — and when you do not need one at all.",
    category: "tutorial",
    source: "/blogs/tutorial/Distributed-Locks-Redis.md",
    minutes: 9,
  },
  {
    slug: "rate-limiting-token-bucket-spring-boot",
    date: "2026-07-02",
    writer: siteIdentity.name,
    header: "Rate limiting a real API: token bucket in Spring Boot",
    description: "From annotation to Redis-backed bucket, with the edge cases that show up after launch.",
    category: "tutorial",
    source: "/blogs/tutorial/Rate-Limiting-Token-Bucket.md",
    minutes: 11,
  },
  {
    slug: "distributed-monolith-extra-invoices",
    date: "2026-06-21",
    writer: siteIdentity.name,
    header: "When microservices become a distributed monolith",
    description:
      "How to use delivery, ownership, and incident evidence to decide whether a service boundary is earning its operational cost.",
    category: "rant",
    source: "/blogs/rant/Distributed-Monolith-Extra-Invoices.md",
    minutes: 5,
  },
  {
    slug: "lambda-pricing-infra-alone",
    date: "2026-06-10",
    writer: siteIdentity.name,
    header: "What Lambda pricing means when you operate infrastructure alone",
    description:
      "A practical cost review that separates Lambda Functions from MicroVMs and accounts for the infrastructure around either choice.",
    category: "news",
    source: "/blogs/news/Lambda-Pricing-Infra-Alone.md",
    minutes: 5,
  },
  {
    slug: "eventbridge-scheduler-quirks",
    date: "2026-05-18",
    writer: siteIdentity.name,
    header: "Operating EventBridge Scheduler with explicit delivery rules",
    description:
      "A practical guide to time zones, idempotent targets, retries, dead-letter queues, and schedule ownership.",
    category: "notes",
    source: "/blogs/others/EventBridge-Scheduler-Quirks.md",
    minutes: 5,
  },
  {
    slug: "business-logic-auth-middleware",
    date: "2026-05-30",
    writer: siteIdentity.name,
    header: "Keep business rules out of authentication middleware",
    description:
      "Why authentication belongs at the boundary while resource-level authorization and policy remain with the use case.",
    category: "rant",
    source: "/blogs/rant/Business-Logic-Auth-Middleware.md",
    minutes: 5,
  },
];

/**
 * Orders the catalog for the blog index without changing the authored catalog.
 *
 * The index calls this before publishing its data event, so a newly added post
 * appears in date order even when its object is appended anywhere in
 * `blogPosts`. ISO dates sort correctly as strings, with the newest first.
 *
 * @returns A new newest-first catalog array for the index's children.
 */
export const getBlogPostsForIndex = (): readonly BlogPost[] =>
  [...blogPosts].sort((first, second) => second.date.localeCompare(first.date));

/**
 * Finds the newest post that belongs in the highlighted index card.
 *
 * Both the highlighted card and archive call this with the same catalog event
 * payload. Keeping the decision here ensures the newest configured post moves
 * out of the archive automatically, regardless of its position in `blogPosts`.
 *
 * @param posts - Catalog records received by an index component.
 * @returns The post with the latest ISO date, or `undefined` for an empty catalog.
 */
export const getLatestBlogPost = (posts: readonly BlogPost[]): BlogPost | undefined =>
  posts.reduce<BlogPost | undefined>(
    (latestPost, post) => !latestPost || post.date > latestPost.date ? post : latestPost,
    undefined,
  );

/**
 * Resolves the authored catalog entry consumed by the article route and SEO.
 *
 * @param slug - Decoded route segment to look up.
 * @returns The matching post, or `undefined` when the route should render not-found.
 */
export const getBlogPost = (slug: string): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);

/**
 * Extracts and decodes the article slug used by the route data coordinator.
 * Invalid paths and malformed percent-encoding return an empty string so callers
 * can fall back to the index route behavior.
 *
 * @param pathname - Browser pathname, normally `window.location.pathname`.
 * @returns The decoded slug, or an empty string when the path is not an article path.
 */
export const getBlogSlug = (pathname: string): string => {
  const match = /^\/blog\/([^/]+)\/?$/.exec(pathname);
  if (!match) {
    return "";
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
};

/**
 * Formats an authored ISO date for display in the index or article metadata.
 *
 * @param date - Calendar date in the catalog's `YYYY-MM-DD` format.
 * @param short - Uses an abbreviated month for compact list rows when `true`.
 * @returns A localized English date label.
 */
export const formatBlogDate = (date: string, short = false): string =>
  new Intl.DateTimeFormat("en-US", {
    month: short ? "short" : "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

/**
 * Converts a catalog category into the human-readable label shown in the UI.
 *
 * @param category - Literal category from a `BlogPost` record.
 * @returns The title-cased label used by cards and filter-aware metadata.
 */
export const labelForCategory = (category: BlogCategory): string => {
  const labels: Record<BlogCategory, string> = {
    tutorial: "Tutorial",
    rant: "Rant",
    news: "News",
    notes: "Notes",
  };

  return labels[category];
};
