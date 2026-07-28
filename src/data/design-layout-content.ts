import type { PageSeoContent } from "@app/data/seo-content.ts";

/** Authored reference content for the shared layout system. */
export const designLayoutContent = {
  seo: {
    title: "Layout design grammar | ayu-sh-kr",
    description: "A live reference for the portfolio's shared page widths, gutters, and reading measures.",
    keywords: ["design system", "layout", "page width", "Dota Web"],
    ogTitle: "Layout design grammar | ayu-sh-kr",
    ogDescription: "Live reference for the portfolio's shared layout system.",
  } satisfies PageSeoContent,
  overview: {
    eyebrow: "Design grammar / 03",
    title: "One page frame, with room for content to breathe.",
    lede: "The shared 80rem frame aligns page sections across the portfolio. Individual components can choose a narrower measure only when the content itself needs focused reading or interaction.",
  },
  roles: {
    eyebrow: "Layout roles",
    title: "Choose the measure by what the content needs.",
    lede: "Use the page frame for route sections. Use narrower measures only inside that frame, not as a substitute for page alignment.",
    items: [
      { token: "--layout-page-max", title: "Page", value: "80rem", description: "The default outer frame for page sections, grids, and route-level calls to action." },
      { token: "--layout-content-max", title: "Content", value: "60rem", description: "A focused inner measure for dense forms, grouped controls, or compact explanatory content." },
      { token: "--layout-reading-max", title: "Reading", value: "45rem", description: "A comfortable measure for legal pages, articles, and other long-form copy." },
      { token: "--layout-gutter", title: "Gutter", value: "1.25rem–3rem", description: "Responsive space between the viewport edge and every shared layout measure." },
    ],
  },
  guidance: {
    eyebrow: "Implementation",
    title: "Keep the outer edge shared.",
    lede: "The outer section should use the page frame; a card, article, or form may narrow inside it. This keeps neighboring sections aligned without making every line of copy overly wide.",
    rules: [
      "Start route sections with .layout-page or --layout-page-max.",
      "Use .layout-content for focused controls inside a page section.",
      "Use .layout-reading only for sustained prose, not for general page sections.",
      "Use --layout-gutter instead of local viewport padding values when adding new page shells.",
    ],
  },
} as const;

/** Inferred content contract shared by the layout reference route and its sections. */
export type DesignLayoutContent = typeof designLayoutContent;
