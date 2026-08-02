import type { PageSeoContent } from "@app/data/seo-content.ts";

/** Authored reference content for the shared layout system. */
export const designLayoutContent = {
  seo: {
    title: "Layout design grammar | ayu-sh-kr",
    description: "A live reference for the portfolio's shared containers, rhythm, grids, radii, and responsive layout rules.",
    keywords: ["design system", "layout", "responsive design", "Dota Web"],
    ogTitle: "Layout design grammar | ayu-sh-kr",
    ogDescription: "Live layout primitives and migration rules for the portfolio.",
  } satisfies PageSeoContent,
  overview: {
    eyebrow: "Design grammar / 03",
    title: "One geometry system, built into every route.",
    lede: "Containers follow content shape; sections own vertical rhythm; grids and sticky chrome share the same responsive rules. These specimens render from src/layout.css, so the reference is the application.",
    frame: { ariaLabel: "80rem page frame specimen", label: "Shared page frame", value: "80rem" },
  },
  roles: {
    eyebrow: "Layout roles",
    title: "Choose the measure by the content shape.",
    lede: "One container belongs on a section. At the widest breakpoint, count columns before choosing it—never nest containers to compensate for local alignment.",
    items: [
      { token: ".layout-page", title: "Three-plus columns", value: "80rem", description: "Site chrome, footer, showcase layouts, and design grammar." },
      { token: ".layout-content", title: "One or two UI columns", value: "60rem", description: "Support, estimators, grouped controls, and paired work areas." },
      { token: ".layout-reading", title: "Long-form prose", value: "45rem", description: "Articles, legal documents, and case-study reading flow." },
      { token: ".layout-form", title: "Single-column form", value: "38rem", description: "Intake fields that remain easy to scan back to their labels." },
    ],
  },
  primitives: {
    eyebrow: "Layout primitives",
    title: "The tokens that make sections agree.",
    lede: "The space scale is shared by stacks, grids, and fixed chrome. Section rhythm stays on the section; cards and controls consume the same geometry without owning page spacing.",
    space: [
      ["--layout-space-1", "4px"], ["--layout-space-2", "8px"], ["--layout-space-3", "12px"], ["--layout-space-4", "16px"], ["--layout-space-5", "24px"], ["--layout-space-6", "32px"], ["--layout-space-7", "48px"], ["--layout-space-8", "64px"], ["--layout-space-9", "96px"], ["--layout-space-10", "128px"],
    ],
    rhythm: [
      { token: ".layout-section-hero", use: "First section under the navigation" },
      { token: ".layout-section-lg", use: "Major visual band" },
      { token: ".layout-section", use: "Default route section" },
      { token: ".layout-section-sm", use: "Dense metadata or link strip" },
    ],
    grid: {
      label: "Responsive composition",
      title: ".layout-grid-auto first",
      body: "A content-driven grid uses 260px minimum tracks. Fixed-count grids and the sticky rail are reserved for content where the count or hierarchy carries meaning.",
    },
    chrome: [
      { token: "--layout-stick", use: "Anchor and sticky offset below the navigation" },
      { token: "--layout-z-nav", use: "Site header" },
      { token: "--layout-z-sticky", use: "Scrollspy or side rail" },
      { token: "--layout-z-toast", use: "Safe-area-aware sticky contact control" },
    ],
    specimens: {
      space: { ariaLabel: "Space scale", label: "Shared spacing", title: "One scale for every gap." },
      rhythm: { ariaLabel: "Section rhythm", label: "Section rhythm", title: "Sections own the breathing room." },
      gridAriaLabel: "Content-driven grid specimen",
      chromeAriaLabel: "Chrome token reference",
      chromeLabel: "Fixed and sticky chrome",
    },
  },
  guidance: {
    eyebrow: "Implementation",
    title: "Keep the contract visible in every component.",
    lede: "Layout handles page geometry only. Components supply semantic colour and surface treatment, then consume the shared spaces, radii, and responsive primitives without recreating them.",
    rules: [
      "Choose one container by the widest content shape; never nest layout containers.",
      "Put vertical breathing room on a .layout-section* class, then use .layout-stack for its direct children.",
      "Use .layout-grid-auto before a fixed grid; use only 520px, 700px, and 1100px viewport breakpoints.",
      "Use --layout-stick and named --layout-z-* layers for anchors, rails, navigation, and fixed controls.",
    ],
  },
} as const;

/** Inferred content contract shared by the layout reference route and its sections. */
export type DesignLayoutContent = typeof designLayoutContent;
