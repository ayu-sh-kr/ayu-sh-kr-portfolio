import {siteIdentity} from "@app/data/portfolio-content.ts";
import type {PageSeoContent} from "@app/data/seo-content.ts";

/** Editorial role used to filter Dispatch notes and label their permalink pages. */
export type NewsKind = "shipped" | "infra" | "reading" | "take";

/** A measured outcome shown only in the article's number-focused figure panel. */
export type NewsFigure = {
  /** Short context that makes the adjacent value meaningful. */
  label: string;
  /** Compact authored value kept separate from explanatory prose. */
  value: string;
};

/** Optional source-of-record link attached to a Dispatch note. */
export type NewsReference = {
  /** Human-readable description of the linked record. */
  label: string;
  /** Absolute destination used by the external source row. */
  href: string;
};

/**
 * Authored contract shared by the Dispatch feed, permalink route, loader, and SEO.
 * Adding a note here and its Markdown document under `public/news` makes the same
 * source available to every news surface without duplicating route metadata.
 */
export type NewsNote = {
  /** Stable path segment used by `/news/:slug`. */
  slug: string;
  /** ISO publication date used for ordering and machine-readable time elements. */
  date: string;
  /** Permalink heading and linked feed title. */
  title: string;
  /** Complete feed summary reused verbatim as the article standfirst. */
  summary: string;
  /** Editorial role used by the filter dock and related-note selection. */
  kind: NewsKind;
  /** Root-relative Markdown document fetched by `NewsLoaderService`. */
  document: string;
  /** Search vocabulary specific to this note. */
  keywords: readonly string[];
  /** Compact reading estimate shown beside the publication date. */
  minutes: number;
  /** Optional measured outcomes; absence removes the figure panel entirely. */
  figures?: readonly NewsFigure[];
  /** Optional external source rendered after the note body. */
  reference?: NewsReference;
};

/** Stable filter choices rendered by the floating Dispatch dock. */
export const newsFilters: readonly {value: NewsKind | "all"; label: string}[] = [
  {value: "all", label: "All notes"},
  {value: "shipped", label: "Shipped"},
  {value: "infra", label: "Infra"},
  {value: "reading", label: "Reading"},
  {value: "take", label: "Takes"},
];

/**
 * Dummy Dispatch catalogue adapted from the approved iteration-34 demos.
 * Newest-first ordering is derived by {@link getNewsNotes}; authored order is
 * deliberately not treated as a publishing control.
 */
export const newsNotes: readonly NewsNote[] = [
  {
    slug: "claude-opus-5-5-cost-coding",
    date: "2026-09-25",
    title: "Claude Opus 5.5 gets cheaper as Claude Code adds cloud-session credits",
    summary: "Anthropic says Claude Opus 5.5 costs about 40% less on typical work, while existing Pro and Max subscribers can claim $100 or $250 for Claude Code cloud sessions by October 7.",
    kind: "reading",
    document: "/news/claude-opus-5-5-cost-coding.md",
    keywords: ["Claude Opus 5.5", "Claude Opus 5.5 pricing", "Claude Code cloud sessions", "Claude Code free credit", "Claude Code claim-credit", "Claude Pro credit", "Claude Max credit", "AI coding agents", "code-generated animation"],
    minutes: 4,
    figures: [
      {label: "Typical workload cost", value: "40% less"},
      {label: "Input / output", value: "$4 / $20 per M"},
      {label: "Cache-read cost", value: "60% less"},
    ],
    reference: {label: "Anthropic — Introducing Claude Opus 5.5", href: "https://www.anthropic.com/claude-opus-5-5"},
  },
  {
    slug: "jev-typesafe-system-one-model",
    date: "2026-09-21",
    title: "Jev gives AI agents a fast gut check before the expensive thinking begins",
    summary: "LangChain has added Jev, TypeSafe AI’s non-generative System One model, for fast structured decisions such as model routing and tool-call risk checks inside an agent harness.",
    kind: "reading",
    document: "/news/jev-typesafe-system-one-model.md",
    keywords: ["Jev model", "TypeSafe AI", "LangChain Jev", "System One model", "AI agent harness", "agent model routing", "AI tool-call safety", "structured AI decisions"],
    minutes: 2,
    reference: {label: "LangChain — Building a Harness with Jev", href: "https://www.langchain.com/blog/building-a-harness-with-jev"},
  },
  {
    slug: "jhipster-online-infostealer-malware",
    date: "2026-09-21",
    title: "JHipster Online warns users after infostealer malware exposes credentials",
    summary: "JHipster Online says exposed credentials point to infostealer malware on affected devices, not a breach of its own database. The response shows why device cleanup matters before password rotation.",
    kind: "reading",
    document: "/news/jhipster-online-infostealer-malware.md",
    keywords: ["JHipster Online malware", "infostealer malware", "JHipster credential exposure", "browser password theft", "credential security", "device compromise", "password reset", "session invalidation"],
    minutes: 2,
    reference: {label: "JHipster Online warning shared by Julien Dubois", href: "https://gist.github.com/jdubois/19ffaf2c8a994fd8e4b5f638342269d9"},
  },
  {
    slug: "cloudflare-trycloudflare-quick-tunnel",
    date: "2026-09-20",
    title: "Cloudflare Quick Tunnels take localhost to the internet",
    summary: "Shared localhost:3000 and wondered why nobody could open it? Cloudflare Quick Tunnels give your local app a free public HTTPS link for demos and feedback.",
    kind: "reading",
    document: "/news/cloudflare-trycloudflare-quick-tunnel.md",
    keywords: ["Cloudflare Quick Tunnels", "trycloudflare.com", "cloudflared tunnel", "share localhost", "local development tunnel", "temporary public URL", "share local app online", "developer demos"],
    minutes: 2,
    reference: {label: "Cloudflare documentation — TryCloudflare", href: "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/"},
  },
  {
    slug: "zcode-user-code-upload-key",
    date: "2026-09-20",
    title: "Z.ai's ZCode was caught stealing user code — silently uploading a 313MB project snapshot with a server-only key",
    summary: "Z.ai's ZCode was caught staging an encrypted 313MB workspace archive — Git history included — for upload to Alibaba cloud storage, decryptable only by a private key on Z.ai's server. Z.ai apologised and called it a bug.",
    kind: "reading",
    document: "/news/zcode-user-code-upload-key.md",
    keywords: ["Z.ai ZCode", "Zhipu ZCode upload", "AI coding tool privacy", "ZCode Git history upload", "Ferstar ZCode investigation", "Alibaba cloud upload", "AI coding assistant data collection", "developer tool telemetry"],
    minutes: 2,
    reference: {label: "Ferstar — Inside ZCode", href: "https://blog.ferstar.org/en/posts/zcode-silent-workspace-snapshot-upload/"},
  },
  {
    slug: "openbot-self-hosted-ai-coworkers",
    date: "2026-09-19",
    title: "CopilotKit OpenBot: self-hosted AI coworkers and agent controls",
    summary: "CopilotKit OpenBot is an open-source, self-hosted AI coworker template with isolated browsers, AG-UI agents, policy checks, and audit trails. It is currently alpha.",
    kind: "reading",
    document: "/news/openbot-self-hosted-ai-coworkers.md",
    keywords: ["CopilotKit OpenBot", "open-source AI coworkers", "self-hosted AI agents", "AG-UI protocol", "AI browser agents", "agent policy enforcement", "AI agent audit trails", "human-in-the-loop control"],
    minutes: 2,
    reference: {label: "CopilotKit/OpenBot on GitHub", href: "https://github.com/CopilotKit/openbot"},
  },
  {
    slug: "perplexity-cobbledb",
    date: "2026-09-20",
    title: "Perplexity CobbleDB: why AI search moved beyond DynamoDB",
    summary: "Why Perplexity replaced DynamoDB with CobbleDB: a RocksDB-backed hot store with Pillar and Lorry for batched updates and low-latency reads for AI search.",
    kind: "reading",
    document: "/news/perplexity-cobbledb.md",
    keywords: ["Perplexity CobbleDB", "CobbleDB architecture", "Perplexity DynamoDB replacement", "RocksDB MultiGet", "AI search storage", "distributed key-value store", "Pillar Lorry pipeline", "batched ingestion", "replica read latency"],
    minutes: 3,
    reference: {label: "Perplexity engineering — CobbleDB", href: "https://www.perplexity.ai/hub/blog/cobbledb-storage-infrastructure-for-ai-native-search-at-scale"},
  },
  {
    slug: "qorl-postgres-query-optimizer-rl",
    date: "2026-09-19",
    title: "A 4B open-weights model, retrained on one task, beats the Postgres query planner",
    summary: "One person, one sabbatical, $1,200: a small open-weights model retrained on a single dedicated task — planning Postgres queries — beat the planner by 1.81x. The interesting units of AI progress are getting small, specialized, and cheap.",
    kind: "reading",
    document: "/news/qorl-postgres-query-optimizer-rl.md",
    keywords: ["small specialized models", "open-weights AI", "reinforcement learning", "PostgreSQL", "AI accessibility"],
    minutes: 2,
    figures: [
      {label: "Geo mean speedup", value: "1.81x"},
      {label: "Latency reduction", value: "44.7%"},
      {label: "Training cost", value: "~$1,200"},
    ],
    reference: {label: "Rohan Bansal — QoRL write-up", href: "https://rohanbansal.com/qorl"},
  },
  {
    slug: "prismml-bonsai-2-27b",
    date: "2026-09-18",
    title: "PrismML's Bonsai 2 27B: near-lossless ternary compression at a 5.9GB footprint",
    summary: "1.76 bits per weight, 98.2% of full-precision benchmark performance at 9x smaller, 143 tokens/second on a 5090. Local inference just got interesting again.",
    kind: "reading",
    document: "/news/prismml-bonsai-2-27b.md",
    keywords: ["PrismML Bonsai 2 27B", "ternary quantization", "local AI inference"],
    minutes: 2,
    figures: [
      {label: "Retention", value: "98.2%"},
      {label: "Footprint", value: "5.9GB"},
      {label: "Throughput", value: "143 tok/s"},
    ],
    reference: {label: "PrismML announcement", href: "https://prismml.com/news/bonsai-2-27b"},
  },
  {
    slug: "sacrena-match-feed-redis-cache",
    date: "2026-09-12",
    title: "Sacrena's match feed now serves from a Redis read-through cache",
    summary: "p95 dropped from 310ms to 41ms. The interesting part wasn't the cache — it was deleting the three “optimised” queries it made redundant.",
    kind: "shipped",
    document: "/news/sacrena-match-feed-redis-cache.md",
    keywords: ["Redis read-through cache", "query performance", "Sacrena"],
    minutes: 1,
    figures: [
      {label: "p95 before", value: "310ms"},
      {label: "p95 after", value: "41ms"},
      {label: "Queries removed", value: "3"},
    ],
  },
  {
    slug: "graalvm-lambda-cold-start",
    date: "2026-09-09",
    title: "GraalVM native image cut my Lambda cold start to 190ms",
    summary: "Spring Cloud Function on a custom runtime, container image, 512MB. Build time went the other way — 40s to 6 minutes — which is a fine trade for a function that runs on someone else's page load.",
    kind: "infra",
    document: "/news/graalvm-lambda-cold-start.md",
    keywords: ["GraalVM native image", "AWS Lambda cold start", "Spring Cloud Function"],
    minutes: 2,
    figures: [
      {label: "Cold start before", value: "2.4s"},
      {label: "Cold start after", value: "190ms"},
      {label: "Build time", value: "40s → 6m"},
    ],
    reference: {label: "GraalVM Native Image reference", href: "https://www.graalvm.org/latest/reference-manual/native-image/"},
  },
  {
    slug: "postgres-18-skip-scan",
    date: "2026-09-05",
    title: "Postgres 18's skip scan is quietly a big deal for composite indexes",
    summary: "Half the “we need a second index” tickets I've written over four years were this problem. Worth reading the release notes end to end rather than the summary posts.",
    kind: "reading",
    document: "/news/postgres-18-skip-scan.md",
    keywords: ["PostgreSQL 18", "skip scan", "composite indexes"],
    minutes: 1,
    reference: {label: "PostgreSQL documentation", href: "https://www.postgresql.org/docs/current/indexes-multicolumn.html"},
  },
  {
    slug: "postgres-queue-before-kafka",
    date: "2026-09-02",
    title: "Most “we need Kafka” conversations end at a Postgres table",
    summary: "If the queue never exceeds a few thousand rows and one consumer drains it, a table with `FOR UPDATE SKIP LOCKED` is the whole system. Add the broker when the second consumer shows up, not before.",
    kind: "take",
    document: "/news/postgres-queue-before-kafka.md",
    keywords: ["PostgreSQL queue", "Kafka alternative", "SKIP LOCKED"],
    minutes: 1,
  },
  {
    slug: "quote-intake-dynamodb-on-demand",
    date: "2026-08-26",
    title: "Quote intake now writes straight to DynamoDB on-demand",
    summary: "No RDS instance idling for eleven forms a month. Costs about the price of a coffee per year, which felt worth saying out loud.",
    kind: "shipped",
    document: "/news/quote-intake-dynamodb-on-demand.md",
    keywords: ["DynamoDB on-demand", "AWS cost", "form backend"],
    minutes: 1,
  },
  {
    slug: "self-hosted-github-runners",
    date: "2026-08-18",
    title: "Self-hosted GitHub runners on a t4g.medium paid for themselves in nine days",
    summary: "Provisioned via CloudFormation, configured with no SSH access at all. The sizing note: builds are memory-bound long before they're CPU-bound.",
    kind: "infra",
    document: "/news/self-hosted-github-runners.md",
    keywords: ["GitHub Actions runner", "AWS Graviton", "CI infrastructure"],
    minutes: 1,
    figures: [
      {label: "Break-even", value: "9 days"},
      {label: "Runner", value: "t4g.medium"},
      {label: "SSH access", value: "None"},
    ],
  },
  {
    slug: "rate-limiting-counter-ownership",
    date: "2026-08-07",
    title: "Rate limiting belongs at the edge, but the counter belongs to you",
    summary: "CloudFront can drop the obvious floods. Anything that needs to know what a user is allowed to do is application logic wearing a gateway costume.",
    kind: "take",
    document: "/news/rate-limiting-counter-ownership.md",
    keywords: ["rate limiting", "CloudFront", "application authorization"],
    minutes: 1,
  },
  {
    slug: "kotlin-context-parameters",
    date: "2026-07-21",
    title: "The Kotlin context parameters proposal, read twice",
    summary: "First read: clever. Second read: this removes an entire category of constructor plumbing from my service layer.",
    kind: "reading",
    document: "/news/kotlin-context-parameters.md",
    keywords: ["Kotlin context parameters", "Kotlin language design", "dependency injection"],
    minutes: 1,
    reference: {label: "Kotlin context parameters proposal", href: "https://github.com/Kotlin/KEEP/blob/master/proposals/context-parameters.md"},
  },
  {
    slug: "dota-wrap-ssr-hydration",
    date: "2026-07-03",
    title: "Dota Wrap now ships server-rendered markup with hydration",
    summary: "Web components, no framework runtime, first paint without JavaScript. This site is the first thing running on it.",
    kind: "shipped",
    document: "/news/dota-wrap-ssr-hydration.md",
    keywords: ["web components SSR", "hydration", "Dota Wrap"],
    minutes: 1,
    reference: {label: "Dota Wrap package", href: "https://www.npmjs.com/package/@ayu-sh-kr/dota-wrap"},
  },
];

const NEWS_INDEX_KEYWORDS = [siteIdentity.name, "The Dispatch", "backend notes", "infrastructure notes", "engineering updates"] as const;

/** Orders the authored catalogue newest-first for every consumer. */
export const getNewsNotes = (): readonly NewsNote[] =>
  [...newsNotes].sort((first, second) => second.date.localeCompare(first.date));

/** Resolves the note consumed by the permalink route and loader boundary. */
export const getNewsNote = (slug: string): NewsNote | undefined =>
  newsNotes.find((note) => note.slug === slug);

/** Extracts a safe decoded slug from the canonical news detail path. */
export const getNewsSlug = (pathname: string): string => {
  const match = /^\/news\/([^/]+)\/?$/.exec(pathname);
  if (!match) {
    return "";
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
};

/** Formats an authored date consistently across feed and permalink metadata. */
export const formatNewsDate = (date: string, short = false): string =>
  new Intl.DateTimeFormat("en-US", {
    month: short ? "short" : "long",
    day: "numeric",
    year: short ? undefined : "numeric",
  }).format(new Date(`${date}T00:00:00`));

/** Converts a stable kind into the editorial label shown to readers. */
export const labelForNewsKind = (kind: NewsKind): string =>
  newsFilters.find((filter) => filter.value === kind)?.label ?? kind;

/** Derives index and note metadata from the same catalogue that renders the UI. */
export const getNewsSeo = (note?: NewsNote): PageSeoContent => {
  const title = note ? `${note.title} — ${siteIdentity.domain}` : `The Dispatch — ${siteIdentity.domain}`;
  const description = note?.summary ?? "Short notes on backend systems, infrastructure, useful reading, and what Ayush Kumar shipped.";

  return {
    title,
    description,
    keywords: note ? [...note.keywords] : [...NEWS_INDEX_KEYWORDS],
    ogTitle: title,
    ogDescription: description,
  };
};

/** SEO fallback used when a news slug has no matching catalogue entry. */
export const newsNotFoundSeo: PageSeoContent = {
  title: `Note not found — ${siteIdentity.domain}`,
  description: "The requested Dispatch note could not be found.",
  keywords: NEWS_INDEX_KEYWORDS,
  ogTitle: `Note not found — ${siteIdentity.domain}`,
  ogDescription: "The requested Dispatch note could not be found.",
};
