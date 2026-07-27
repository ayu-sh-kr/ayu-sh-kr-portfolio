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
  /** Marks the post shown in the highlighted index section; only one is expected. */
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "distributed-locks-redis",
    date: "2026-07-12",
    writer: siteIdentity.name,
    header: "Distributed locks in Redis, without the folklore",
    description:
      "Everyone copies the same SETNX snippet. Here is what actually matters when a lock is guarding real money — and when you do not need one at all.",
    category: "tutorial",
    source: "/blogs/tutorial/Distributed-Locks-Redis.md",
    minutes: 8,
    featured: true,
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
    header: "Your microservices are a distributed monolith with extra invoices",
    description: "Five services, one deploy train, zero benefits. A short field guide to architecture theatre.",
    category: "rant",
    source: "/blogs/rant/Distributed-Monolith-Extra-Invoices.md",
    minutes: 5,
  },
  {
    slug: "lambda-pricing-infra-alone",
    date: "2026-06-10",
    writer: siteIdentity.name,
    header: "What the new Lambda pricing means if you run infra alone",
    description: "A solo operator’s read, with the numbers that actually change a small production bill.",
    category: "news",
    source: "/blogs/news/Lambda-Pricing-Infra-Alone.md",
    minutes: 4,
  },
  {
    slug: "eventbridge-scheduler-quirks",
    date: "2026-05-18",
    writer: siteIdentity.name,
    header: "TIL: EventBridge scheduler quirks",
    description: "Two minutes that might save your cron migration from a very confusing Monday morning.",
    category: "notes",
    source: "/blogs/others/EventBridge-Scheduler-Quirks.md",
    minutes: 2,
  },
  {
    slug: "business-logic-auth-middleware",
    date: "2026-05-30",
    writer: siteIdentity.name,
    header: "Stop putting business logic in your auth middleware",
    description: "It is a bouncer, not a bartender. Keep identity checks close to the boundary and decisions in the domain.",
    category: "rant",
    source: "/blogs/rant/Business-Logic-Auth-Middleware.md",
    minutes: 6,
  },
];

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
