export type BlogCategory = "tutorial" | "rant" | "news" | "notes";

export type BlogPost = {
  slug: string;
  date: string;
  writer: string;
  header: string;
  description: string;
  category: BlogCategory;
  /** Root-relative URL for the Markdown source in `public/blogs`. */
  source: string;
  minutes: number;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "distributed-locks-redis",
    date: "2026-07-12",
    writer: "Ayush Jaiswal",
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
    writer: "Ayush Jaiswal",
    header: "Rate limiting a real API: token bucket in Spring Boot",
    description: "From annotation to Redis-backed bucket, with the edge cases that show up after launch.",
    category: "tutorial",
    source: "/blogs/tutorial/Rate-Limiting-Token-Bucket.md",
    minutes: 11,
  },
  {
    slug: "distributed-monolith-extra-invoices",
    date: "2026-06-21",
    writer: "Ayush Jaiswal",
    header: "Your microservices are a distributed monolith with extra invoices",
    description: "Five services, one deploy train, zero benefits. A short field guide to architecture theatre.",
    category: "rant",
    source: "/blogs/rant/Distributed-Monolith-Extra-Invoices.md",
    minutes: 5,
  },
  {
    slug: "lambda-pricing-infra-alone",
    date: "2026-06-10",
    writer: "Ayush Jaiswal",
    header: "What the new Lambda pricing means if you run infra alone",
    description: "A solo operator’s read, with the numbers that actually change a small production bill.",
    category: "news",
    source: "/blogs/news/Lambda-Pricing-Infra-Alone.md",
    minutes: 4,
  },
  {
    slug: "eventbridge-scheduler-quirks",
    date: "2026-05-18",
    writer: "Ayush Jaiswal",
    header: "TIL: EventBridge scheduler quirks",
    description: "Two minutes that might save your cron migration from a very confusing Monday morning.",
    category: "notes",
    source: "/blogs/others/EventBridge-Scheduler-Quirks.md",
    minutes: 2,
  },
  {
    slug: "business-logic-auth-middleware",
    date: "2026-05-30",
    writer: "Ayush Jaiswal",
    header: "Stop putting business logic in your auth middleware",
    description: "It is a bouncer, not a bartender. Keep identity checks close to the boundary and decisions in the domain.",
    category: "rant",
    source: "/blogs/rant/Business-Logic-Auth-Middleware.md",
    minutes: 6,
  },
];

export const getBlogPost = (slug: string): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);

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

export const formatBlogDate = (date: string, short = false): string =>
  new Intl.DateTimeFormat("en-US", {
    month: short ? "short" : "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export const labelForCategory = (category: BlogCategory): string => {
  const labels: Record<BlogCategory, string> = {
    tutorial: "Tutorial",
    rant: "Rant",
    news: "News",
    notes: "Notes",
  };

  return labels[category];
};
