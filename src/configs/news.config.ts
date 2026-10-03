import {newsContent} from "@app/data/news-content.ts";
import {siteIdentity} from "@app/data/portfolio-content.ts";
import type {PageSeoContent} from "@app/data/seo-content.ts";

/** Editorial role used to filter Dispatch notes and label their permalink pages. */
export type NewsKind = "shipped" | "infra" | "reading" | "explainer" | "take";

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
  {value: "explainer", label: "Explainers"},
  {value: "take", label: "Takes"},
];

/**
 * Published Dispatch catalogue.
 * Newest-first ordering is derived by {@link getNewsNotes}; authored order is
 * deliberately not treated as a publishing control.
 */
export const newsNotes: readonly NewsNote[] = [
  {
    slug: "cloudflare-artifacts-next-git-platform",
    date: "2026-10-03",
    title: "Cloudflare opens Artifacts beta for GitHub alternatives built around AI agents",
    summary: "Cloudflare Artifacts enters open beta with Git repository automation and Workers deployment. How it supports AI agents and the contest to build a GitHub alternative.",
    kind: "infra",
    document: "/news/cloudflare-artifacts-next-git-platform.md",
    keywords: ["Cloudflare Artifacts open beta", "GitHub alternatives for AI agents", "Git repository automation", "Cloudflare Workers Builds", "AI coding agent collaboration", "Cloudflare Git platform competition"],
    minutes: 2,
    reference: {label: "Cloudflare — Next Git platform announcement", href: "https://blog.cloudflare.com/next-git-platform-on-cloudflare/"},
  },
  {
    slug: "github-copilot-computer-use",
    date: "2026-10-03",
    title: "GitHub Copilot adds computer use for desktop apps",
    summary: "GitHub Copilot’s computer use preview automates desktop apps on macOS and Windows. Learn how it works, where it helps, and what users can control.",
    kind: "reading",
    document: "/news/github-copilot-computer-use.md",
    keywords: ["GitHub Copilot computer use", "Copilot CLI", "Copilot desktop app", "desktop app automation", "computer use public preview"],
    minutes: 2,
    reference: {label: "GitHub — Copilot computer use announcement", href: "https://github.blog/changelog/2026-10-01-github-copilot-can-now-interact-with-desktop-apps/"},
  },
  {
    slug: "pyronaut-python-micronaut-graalvm",
    date: "2026-10-03",
    title: "Pyronaut launches Python services on Micronaut and GraalVM",
    summary: "Pyronaut launches Python services on Micronaut and GraalVM. How GraalPy runs the code, Crema reuses a native base, and what the launch benchmarks show.",
    kind: "reading",
    document: "/news/pyronaut-python-micronaut-graalvm.md",
    keywords: ["Pyronaut", "GraalVM Python", "GraalPy", "Micronaut Python", "GraalVM Crema", "Python framework performance"],
    minutes: 3,
    reference: {label: "Pyronaut — Introducing Pyronaut", href: "https://pyronaut.io/2026/10/02/introducing-pyronaut/"},
  },
  {
    slug: "decision-models-openai-typesafe-cloudflare",
    date: "2026-10-02",
    title: "Why OpenAI, TypeSafe and Cloudflare are racing to make AI decide",
    summary: "Jev arrived first, OpenAI followed with Decisions API, and Cloudflare answered with open Clef models. Their launches show why AI companies are chasing fast, structured judgments inside agents.",
    kind: "reading",
    document: "/news/decision-models-openai-typesafe-cloudflare.md",
    keywords: ["AI decision models", "OpenAI Decisions API", "TypeSafe Jev", "Cloudflare Clef", "structured AI decisions", "AI agent routing"],
    minutes: 4,
    reference: {label: "Cloudflare — Introducing Clef decision models", href: "https://blog.cloudflare.com/clef-decision-models/"},
  },

  {
    slug: "google-gemini-4-argon-pricing-capabilities",
    date: "2026-10-01",
    title: "Google announces Gemini 4 Argon: capabilities, pricing and access",
    summary: "Google announces Gemini 4 Argon with limited early access. A three-minute look at its coding benchmarks, one-million-token output limit, API prices and later rate increases.",
    kind: "reading",
    document: "/news/google-gemini-4-argon-pricing-capabilities.md",
    keywords: ["Gemini 4 Argon", "Gemini 4 Argon pricing", "Google Gemini 4", "Gemini 4 benchmarks", "Fairwind Program"],
    minutes: 3,
    reference: {label: "Google — Gemini 4 Argon announcement", href: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/"},
  },
  {
    slug: "instacloud-agent-native-serverless-cloud",
    date: "2026-09-30",
    title: "InstaCloud brings deployment into the AI coding agent workflow",
    summary: "InstaCloud connects AI coding agents to serverless deployment, databases, logs, and environment branching. How the workflow takes an API from code to a running service.",
    kind: "infra",
    document: "/news/instacloud-agent-native-serverless-cloud.md",
    keywords: ["InstaCloud","AI coding agent deployment","agent-native cloud","serverless cloud","InsForge"],
    minutes: 3,
    reference: {label: "InstaCloud \u2014 agent-native serverless cloud", href: "https://www.instacloud.com/"},
  },
  {
    slug: "kafgres-kafka-broker-postgres-700mbs",
    date: "2026-09-30",
    title: "Kafgres runs a Kafka-compatible broker inside PostgreSQL",
    summary: "Kafgres embeds a Kafka-compatible broker in PostgreSQL. An order-event example explains the design, its 700 MB/s benchmark, and durability and failover trade-offs.",
    kind: "infra",
    document: "/news/kafgres-kafka-broker-postgres-700mbs.md",
    keywords: ["Kafgres","Kafka broker in PostgreSQL","Postgres event streaming","Rust PostgreSQL extension","Kafka-compatible broker"],
    minutes: 3,
    reference: {label: "Kafgres \u2014 project introduction", href: "https://rynr.dev/blog/kafgres/"},
  },
  {
    slug: "phonon-2-small-local-speech-recognition",
    date: "2026-09-30",
    title: "Phonon-2 brings local English speech recognition to a 164 MB model",
    summary: "Fermion Research’s Phonon-2 compresses English speech recognition into 164 MB. Compare its word error rate with Whisper turbo and understand local transcription speed.",
    kind: "reading",
    document: "/news/phonon-2-small-local-speech-recognition.md",
    keywords: ["Phonon-2","Fermion Research","local English speech recognition","Phonon-2 vs Whisper","on-device transcription"],
    minutes: 3,
    reference: {label: "Fermion Research \u2014 Phonon-2 model card", href: "https://huggingface.co/FermionResearch/Phonon-2"},
  },
  {
    slug: "pageindex-tree-based-rag-relevance",
    date: "2026-09-29",
    title: "PageIndex vs Vector RAG: How Tree Search Finds Relevant Pages",
    summary: "How does PageIndex find the right page? A developer handbook example explains tree-based indexing, vector RAG, and the difference between similarity and relevance.",
    kind: "explainer",
    document: "/news/pageindex-tree-based-rag-relevance.md",
    keywords: ["PageIndex vs vector RAG", "tree-based indexing", "document retrieval", "hierarchical search", "semantic search", "vector database", "retrieval-augmented generation"],
    minutes: 4,
    reference: {label: "VectifyAI — PageIndex on GitHub", href: "https://github.com/VectifyAI/PageIndex"},
  },
  {
    slug: "anthropic-contextual-retrieval-rag",
    date: "2026-09-28",
    title: "Why RAG Misses the Right Passage: Anthropic’s Contextual Retrieval",
    summary: "A store’s return policy shows how document chunks lose context, why semantic search can miss the right answer, and how Anthropic’s Contextual Retrieval helps.",
    kind: "explainer",
    document: "/news/anthropic-contextual-retrieval-rag.md",
    keywords: ["Anthropic Contextual Retrieval", "RAG chunking", "contextual embeddings", "semantic search", "contextual BM25", "reranking", "retrieval failure rate"],
    minutes: 4,
    reference: {label: "Anthropic Engineering — Introducing Contextual Retrieval", href: "https://www.anthropic.com/engineering/contextual-retrieval"},
  },
  {
    slug: "antiburn-coding-agent-token-usage",
    date: "2026-09-28",
    title: "AntiBurn shows where AI coding agents spend their tokens",
    summary: "AntiBurn tracks token use in Claude Code, Codex, and other coding agents. See how its session findings can guide costs, context, and when to stop retrying.",
    kind: "reading",
    document: "/news/antiburn-coding-agent-token-usage.md",
    keywords: ["AntiBurn", "coding agent token usage", "agent context window", "Claude Code token cost", "Codex session analysis"],
    minutes: 3,
    reference: {label: "AntiBurn — product and documentation", href: "https://antiburn.com/docs/"},
  },
  {
    slug: "openscience-ai-research-workbench-stable",
    date: "2026-09-28",
    title: "OpenScience exits beta: an AI workbench for scientific research",
    summary: "OpenScience exits beta with an open-source AI research workbench for literature, data analysis, experiments, and reports. See who it serves and how researchers can check its work.",
    kind: "reading",
    document: "/news/openscience-ai-research-workbench-stable.md",
    keywords: ["OpenScience AI workbench", "scientific research agent", "open-source research tools", "reproducible research", "Synthetic Sciences"],
    minutes: 2,
    reference: {label: "Synthetic Sciences — OpenScience project", href: "https://github.com/synthetic-sciences/openscience"},
  },
  {
    slug: "hacktron-meta-heic-image-bounty",
    date: "2026-09-28",
    title: "Hacktron researcher reports $115,000 Meta bounty for HEIC image flaw",
    summary: "Harsh Jaiswal reportedly earned $115,000 from Meta for a HEIC image flaw. Hacktron’s earlier OpenAI case shows how image decoding and a login flaw widened the risk.",
    kind: "reading",
    document: "/news/hacktron-meta-heic-image-bounty.md",
    keywords: ["Hacktron Meta bounty", "HEIC image vulnerability", "libheif security", "image upload security", "Harsh Jaiswal", "HEIF Heist"],
    minutes: 4,
    reference: {label: "OfficeChai — report on Harsh Jaiswal’s Meta bounty", href: "https://officechai.com/stories/harsh-jaiswal-gets-100000-bug-bounty-from-meta-for-finding-similar-exploits-as-the-openai-hack/"},
  },
  {
    slug: "jevgrep-jev-agent-code-search",
    date: "2026-09-27",
    title: "Jevgrep targets coding agent costs with smarter code search",
    summary: "Jevgrep uses TypeSafe AI's Jev to find relevant code before an agent reads it. See how it works, three quick uses, and what its cost benchmark shows.",
    kind: "reading",
    document: "/news/jevgrep-jev-agent-code-search.md",
    keywords: ["Jevgrep", "TypeSafe AI Jev", "coding agent code search", "agent token usage", "semantic code retrieval", "SWE-bench cost"],
    minutes: 5,
    reference: {label: "dzhng/jevgrep — documentation and source", href: "https://github.com/dzhng/jevgrep"},
  },
  {
    slug: "microsoft-titan-unsigned-jwt-analytics",
    date: "2026-09-27",
    title: "Microsoft Titan flaw let a researcher pose as an admin",
    summary: "A missing token signature check let researcher Faav query Microsoft’s Titan databases. Here is what he accessed and what the 17.3 trillion row estimate means.",
    kind: "reading",
    document: "/news/microsoft-titan-unsigned-jwt-analytics.md",
    keywords: ["Microsoft Titan API", "unsigned JWT", "JWT signature validation", "Faav Microsoft vulnerability", "17 trillion Microsoft records", "Bing analytics security"],
    minutes: 2,
    reference: {label: "Faav — How I Could've Accessed 17 Trillion Microsoft Records", href: "https://blog.faav.net/how-i-couldve-accessed-17-trillion-microsoft-records"},
  },
  {
    slug: "prek-rust-pre-commit-hooks",
    date: "2026-09-27",
    title: "prek: an open-source pre-commit alternative built in Rust",
    summary: "prek runs existing pre-commit hooks with a Rust runner, shared toolchains, and monorepo support, reducing setup without rewriting hook configurations.",
    kind: "reading",
    document: "/news/prek-rust-pre-commit-hooks.md",
    keywords: ["prek", "pre-commit alternative", "Rust Git hook manager", "pre-commit hooks", "monorepo workspace", "uv Python environments"],
    minutes: 2,
    reference: {label: "prek — open-source project and documentation", href: "https://github.com/j178/prek"},
  },
  {
    slug: "github-copilot-runtime-rust-migration",
    date: "2026-09-26",
    title: "GitHub moves Copilot’s agent runtime from TypeScript to Rust",
    summary: "GitHub ported Copilot’s shared agent runtime to Rust so SDK clients can embed it directly. An incremental migration removed Node startup and process overhead, with large gains in GitHub’s local benchmark.",
    kind: "infra",
    document: "/news/github-copilot-runtime-rust-migration.md",
    keywords: ["GitHub Copilot Rust runtime", "Copilot agent runtime migration", "TypeScript to Rust", "GitHub Copilot SDK", "in-process FFI", "agent runtime performance"],
    minutes: 2,
    reference: {label: "GitHub Engineering — Migrating the GitHub Copilot runtime to Rust, using Copilot", href: "https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/"},
  },
  {
    slug: "homa-protocol-tcp-datacenter-ai-latency",
    date: "2026-09-26",
    title: "Homa revisits TCP’s place in the datacenter as AI waits on tiny messages",
    summary: "Stanford’s Homa protocol gives short datacenter messages a faster path than TCP in measured tests. Here is how its receiver-led design works, why AI services might care, and what the benchmarks do not promise.",
    kind: "infra",
    document: "/news/homa-protocol-tcp-datacenter-ai-latency.md",
    keywords: ["Homa protocol", "Homa vs TCP", "datacenter network latency", "Stanford Homa", "AI inference networking", "receiver-driven transport", "RPC tail latency"],
    minutes: 3,
    reference: {label: "USENIX — A Linux Kernel Implementation of the Homa Transport Protocol", href: "https://www.usenix.org/conference/atc21/presentation/ousterhout"},
  },
  {
    slug: "microsoft-copilot-home-code-autopilot",
    date: "2026-09-25",
    title: "Microsoft Copilot adds Code and Autopilot to turn work requests into finished tasks",
    summary: "Microsoft is bringing Chat, Cowork, app building, and a persistent agent into one Copilot experience. Home and Code are headed to Frontier, while Autopilot enters private preview.",
    kind: "reading",
    document: "/news/microsoft-copilot-home-code-autopilot.md",
    keywords: ["Microsoft Copilot Home", "Microsoft Copilot Code", "Microsoft Copilot Autopilot", "Copilot Managed Runtime", "Microsoft 365 Copilot agents", "Copilot Frontier program"],
    minutes: 2,
    reference: {label: "Microsoft — Introducing the new Copilot with Home, Code and Autopilot", href: "https://blogs.microsoft.com/blog/2026/09/25/introducing-the-new-copilot-with-home-code-and-autopilot/"},
  },
  {
    slug: "docker-sandbox-kit-aws-lambda-microvms-agent-coding",
    date: "2026-09-25",
    title: "Docker Sandbox Kit and AWS Lambda MicroVMs make private AI coding agents more practical",
    summary: "Docker's open agent kit format and AWS's isolated MicroVMs point toward a future where organizations package, run, and govern coding agents on their own terms. Here is what they solve—and what they don't.",
    kind: "infra",
    document: "/news/docker-sandbox-kit-aws-lambda-microvms-agent-coding.md",
    keywords: ["Docker Sandbox Kit Spec", "AWS Lambda MicroVMs", "AI coding agent sandbox", "private coding agents", "agentic development", "agent permissions", "Firecracker microVM"],
    minutes: 5,
    reference: {label: "Docker — Sandbox Kit Spec announcement", href: "https://www.docker.com/blog/docker-sandbox-kit-spec-cncf/"},
  },
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

];

const NEWS_INDEX_KEYWORDS = [siteIdentity.name, ...newsContent.seo.keywords] as const;

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
  const title = note ? `${note.title} — ${siteIdentity.domain}` : newsContent.seo.title;
  const description = note?.summary ?? newsContent.seo.description;

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
