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
    summary: "A coordinated set of packages for developing, documenting, and shipping web-component applications.",
    metric: { value: "8", label: "packages, one workspace" },
    visual: "workspace",
  },
  {
    slug: "restaurant-oms",
    source: "/showcases/restaurant-oms.md",
    title: "Restaurant OMS",
    tagline: "Order management for coordinated front-of-house and kitchen service.",
    tier: "featured",
    kind: "product",
    year: 2025,
    status: "shipped",
    stack: ["Spring Boot", "Postgres", "Nuxt"],
    summary: "A restaurant operations product designed around clear order flow, timely updates, and straightforward staff workflows.",
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
    tagline: "A digital catalogue for handcrafted rugs and custom interiors.",
    tier: "archive",
    kind: "client work",
    year: 2026,
    status: "active",
    stack: ["Design System", "Web", "Commerce"],
    summary: "A cohesive retail experience with a shared design system and commerce integration in progress.",
    visual: "jalans",
  },
  {
    slug: "jalans",
    source: "/showcases/jalans.md",
    title: "Jalans",
    tagline: "A clear, accessible web presence for a local clothing retailer.",
    tier: "archive",
    kind: "client work",
    year: 2025,
    status: "shipped",
    stack: ["Design", "Web", "Content"],
    summary: "A focused storefront that presents the business, product range, and customer information without unnecessary complexity.",
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
    summary: "A lightweight authoring layer that adds typed component patterns while retaining native platform behaviour.",
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
    summary: "An observable asynchronous pipeline that separates notification delivery from core product workflows.",
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
    summary: "Typed primitives for request state, data loading, and event-driven integration without obscuring network behaviour.",
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
      title: "Define the scope",
      body: "We establish the intended outcome, delivery constraints, trade-offs, and exclusions before implementation begins.",
    },
    {
      number: "02",
      title: "Maintain visibility",
      body: "Regular progress updates and working increments keep decisions visible throughout the engagement.",
    },
    {
      number: "03",
      title: "Prepare for handover",
      body: "The final system is documented, deployable, and structured for continued ownership by your team.",
    },
  ],
  faq: [
    {
      question: "Do you take freelance work?",
      answer: "Yes. I take on selected backend, AWS infrastructure, and applied AI projects, independently or alongside an existing team.",
    },
    {
      question: "Can you own a whole backend?",
      answer: "Yes. I currently hold end-to-end responsibility for the backend and infrastructure of a production dating application.",
    },
    {
      question: "What is your stack?",
      answer: "My primary stack is Kotlin and Java with Spring Boot, PostgreSQL, Redis, and AWS. For frontend work, I use web components where appropriate.",
    },
    {
      question: "How do we start?",
      answer: "Send a brief outline by email. I will review it and suggest an appropriate next step, usually a short scoping call.",
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
