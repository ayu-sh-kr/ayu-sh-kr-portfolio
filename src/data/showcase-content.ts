import {siteIdentity} from "@app/data/portfolio-content.ts";
import type {PageSeoContent} from "@app/data/seo-content.ts";

/** Categories used to filter and label showcase projects. */
export type ShowcaseProjectKind = "open source" | "product" | "client work" | "backend";

/** Layout tier that determines which landing-page section renders a project. */
export type ShowcaseProjectTier = "spotlight" | "featured" | "archive";

/**
 * Authored content and presentation metadata for one showcase project.
 *
 * The landing page uses the tier, labels, stack, and optional metric to compose
 * cards and spotlights. The article view uses the slug and source to load the
 * corresponding Markdown, while the remaining fields supply its header and
 * navigation metadata.
 */
export interface ShowcaseProject {
  /** Stable URL slug used by the landing-page links and article route. */
  slug: string;
  /** Root-relative URL for the Markdown source in `public/showcases`. */
  source: string;
  /** Display title used in cards, spotlights, and article headers. */
  title: string;
  /** Short value proposition shown beside the project title. */
  tagline: string;
  /** Landing-page section in which this project appears. */
  tier: ShowcaseProjectTier;
  /** Category shown to readers and used by archive filtering. */
  kind: ShowcaseProjectKind;
  /** Project year displayed in metadata and archive rows. */
  year: number;
  /** Current delivery state used in the article metadata row. */
  status: "active" | "shipped" | "archived";
  /** Technology and capability labels shown with the project. */
  stack: string[];
  /** Supporting description retained for project content surfaces. */
  summary: string;
  /** Optional spotlight metric; omit it when a project has no headline measure. */
  metric?: { value: string; label: string };
  /** CSS visual family used by `showcase-visual`. */
  visual: "workspace" | "restaurant" | "sacrena" | "jalans" | "pipeline" | "rest";
}

/** Authored project catalog shared by all showcase landing and article views. */
export const showcaseProjects: ShowcaseProject[] = [
  {
    slug: "dota-workspace",
    source: "/showcases/dota-workspace.md",
    title: "dota-workspace",
    tagline: "A monorepo toolchain for building web-component apps.",
    tier: "spotlight",
    kind: "open source",
    year: 2026,
    status: "active",
    stack: ["TypeScript", "Web Components", "Vite"],
    summary: "The packages behind this very site, shaped into one small and composable workspace.",
    metric: { value: "8", label: "packages, one workspace" },
    visual: "workspace",
  },
  {
    slug: "restaurant-oms",
    source: "/showcases/restaurant-oms.md",
    title: "Restaurant OMS",
    tagline: "Order management that speeds up serving from table to kitchen and back.",
    tier: "featured",
    kind: "product",
    year: 2025,
    status: "shipped",
    stack: ["Spring Boot", "Postgres", "Nuxt"],
    summary: "A product system where every API decision is felt by a busy service team.",
    visual: "restaurant",
  },
  {
    slug: "sacrena",
    source: "/showcases/sacrena.md",
    title: "Sacrena",
    tagline: "The core backend and infrastructure of a growing dating app.",
    tier: "featured",
    kind: "backend",
    year: 2025,
    status: "active",
    stack: ["Kotlin", "AWS", "Redis"],
    summary: "Production ownership across APIs, data, deployments, reliability, and security.",
    visual: "sacrena",
  },
  {
    slug: "indiknots",
    source: "/showcases/indiknots/index.md",
    title: "Indiknots",
    tagline: "A visual-first digital home for handcrafted rugs and custom interiors.",
    tier: "archive",
    kind: "client work",
    year: 2026,
    status: "active",
    stack: ["Design System", "Web", "Commerce"],
    summary: "A visual-first retail experience built on one design grammar, with shopping and payment integration in progress.",
    visual: "jalans",
  },
  {
    slug: "jalans",
    source: "/showcases/jalans.md",
    title: "Jalans",
    tagline: "A warm, useful web presence for a local clothing store.",
    tier: "archive",
    kind: "client work",
    year: 2025,
    status: "shipped",
    stack: ["Design", "Web", "Content"],
    summary: "A small storefront with a clear point of view and no unnecessary machinery.",
    visual: "jalans",
  },
  {
    slug: "dota-wrap",
    source: "/showcases/dota-wrap.md",
    title: "dota-wrap",
    tagline: "A typed wrapper for authoring native web components.",
    tier: "archive",
    kind: "open source",
    year: 2026,
    status: "active",
    stack: ["TypeScript", "Decorators", "DOM"],
    summary: "Framework-like ergonomics while keeping the platform in the driver’s seat.",
    visual: "workspace",
  },
  {
    slug: "event-pipeline",
    source: "/showcases/event-pipeline.md",
    title: "Event pipeline",
    tagline: "SQS/SNS and EventBridge fan-out for production notifications.",
    tier: "archive",
    kind: "backend",
    year: 2025,
    status: "shipped",
    stack: ["AWS", "SQS", "SNS"],
    summary: "A dependable async spine that keeps product workflows decoupled and observable.",
    visual: "pipeline",
  },
  {
    slug: "dota-rest",
    source: "/showcases/dota-rest.md",
    title: "dota-rest",
    tagline: "Typed data-fetching primitives for Dota apps.",
    tier: "archive",
    kind: "open source",
    year: 2026,
    status: "active",
    stack: ["TypeScript", "Fetch", "Events"],
    summary: "Small, typed building blocks for loading data without hiding the network.",
    visual: "rest",
  },
];

/** SEO content for the showcase index, shared by its page shell and cards. */
export const showcaseSeo: PageSeoContent = {
  title: `Showcase — ${siteIdentity.domain}`,
  description: `Selected backend systems, open-source tools, and client work by ${siteIdentity.name}.`,
  keywords: [siteIdentity.name, "Portfolio", "Backend Engineering", "Open Source", "AWS", "TypeScript"],
  ogTitle: `Showcase — ${siteIdentity.domain}`,
  ogDescription: `Selected backend systems, open-source tools, and client work by ${siteIdentity.name}.`,
};

/** Builds SEO content for a selected showcase article or an unknown slug. */
export const getShowcaseSeo = (project?: Pick<ShowcaseProject, "title" | "summary">): PageSeoContent => {
  const title = project ? `${project.title} — ${siteIdentity.domain}` : `Showcase not found — ${siteIdentity.domain}`;
  const description = project?.summary ?? "The requested showcase could not be found.";

  return {
    title,
    description,
    keywords: [siteIdentity.name, "Showcase", "Backend Engineering", "Web Components", "AWS"],
    ogTitle: title,
    ogDescription: description,
  };
};

/** Authored copy for the support section below the project catalog. */
export const showcaseSupport = {
  waysOfWorking: [
    {
      number: "01",
      title: "Scope it together",
      body: "We agree on what success looks like before any code — timelines, tradeoffs, and what is out of scope.",
    },
    {
      number: "02",
      title: "Build in the open",
      body: "Steady progress you can see, not a black box that surfaces at the deadline.",
    },
    {
      number: "03",
      title: "Hand off clean",
      body: "Documented, deployable, and yours — no lock-in to me.",
    },
  ],
  faq: [
    {
      question: "Do you take freelance work?",
      answer: "Yes — backend, AWS infrastructure, and AI-agent work, solo or with your team.",
    },
    {
      question: "Can you own a whole backend?",
      answer: "That is my day job. I run the entire backend and infrastructure for a production dating app as the sole engineer.",
    },
    {
      question: "What is your stack?",
      answer: "Kotlin and Java with Spring Boot, Postgres, Redis, and AWS. Web components when they are the right fit.",
    },
    {
      question: "How do we start?",
      answer: "A short call to scope it. Email below and I will reply with a useful next step.",
    },
  ],
};

/** Filter labels and values used by the archive component and its URL hash. */
export const showcaseFilters: Array<{ value: "all" | ShowcaseProjectKind; label: string }> = [
  { value: "all", label: "All" },
  { value: "open source", label: "Open source" },
  { value: "product", label: "Product" },
  { value: "client work", label: "Client" },
  { value: "backend", label: "Backend" },
];

/** Finds a project by its stable route slug. */
export const getShowcaseProject = (slug: string): ShowcaseProject | undefined =>
  showcaseProjects.find((project) => project.slug === slug);

/** Extracts and decodes a showcase slug from a `/showcase/:slug` pathname. */
export const getShowcaseSlug = (pathname: string): string => {
  const match = /^\/showcase\/([^/]+)\/?$/.exec(pathname);
  if (!match) {
    return "";
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
};

/** Returns the catalog entries assigned to one landing-page tier. */
export const getShowcaseProjectsByTier = (tier: ShowcaseProjectTier): ShowcaseProject[] =>
  showcaseProjects.filter((project) => project.tier === tier);
