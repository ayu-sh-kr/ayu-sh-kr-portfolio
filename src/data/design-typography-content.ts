import type { PageSeoContent } from "@app/data/seo-content.ts";

/**
 * Authored copy and specimen data for the `/design` typography reference.
 *
 * The route shell and its three section components consume this one module so
 * maintainers can revise the grammar without searching through templates.
 */
export const designTypographyContent = {
  seo: {
    title: "Typography design grammar | ayu-sh-kr",
    description: "A live reference for the portfolio typography system and its shared usage rules.",
    keywords: ["design system", "typography", "design grammar", "Dota Web"],
    ogTitle: "Typography design grammar | ayu-sh-kr",
    ogDescription: "Live specimens and usage rules for the portfolio typography system.",
  } satisfies PageSeoContent,
  overview: {
    eyebrow: "Design grammar / 01",
    title: "Typography that holds every page together.",
    lede: "A live reference for choosing type roles. These specimens render from typography.css, so a token change here is the same change visitors see across the portfolio.",
    links: [
      { href: "#design-roles", label: "Browse the role specimens", indicator: "↓" },
      { href: "/design/color", label: "Explore the color grammar", indicator: "→" },
    ],
    summaryAriaLabel: "Typography system summary",
    summaryLabel: "Shared system",
    summary: [
      { label: "Source", value: "src/typography.css" },
      { label: "Family", value: "--primary-font" },
      { label: "Roles", value: "Display to metric" },
      { label: "Color", value: "Semantic tokens only" },
    ],
    roleFlowAriaLabel: "Typography hierarchy",
    roleFlow: ["Display", "Section", "Lede", "Body", "Support"],
  },
  roles: {
    eyebrow: "Design grammar / 02",
    title: "The roles, rendered live.",
    lede: "Choose a role by meaning, not by a font size. Every card below is a shared token that remains consistent between the home, pricing, support, editorial, and legal routes.",
    cards: [
      { label: "Page hero", token: ".type-display", sample: "Make the work unmistakable.", note: "One per route, at the top of the reading order." },
      { label: "Section heading", token: ".type-section", sample: "A clear next chapter", note: "Use for a page-level section, not for card chrome." },
      { label: "Nested heading", token: ".type-subsection", sample: "The practical detail", note: "Keeps a nested group distinct without competing with its parent." },
      { label: "Introductory copy", token: ".type-lede", sample: "A short explanation gives the reader context before the denser content begins.", note: "One calm paragraph below a heading." },
      { label: "Body copy", token: "--type-body-*", sample: "The shared baseline for paragraphs, descriptions, and any copy a reader needs to scan carefully.", note: "Inherited by default; do not recreate this scale locally." },
      { label: "Supporting copy", token: "--type-compact-*", sample: "Updated 12 March · 6 min read", note: "Use for metadata and quiet supporting detail, never as a body-text replacement." },
      { label: "Card title", token: "--type-card-title-*", sample: "Focused card title", note: "A compact title for cards, questions, and grouped controls." },
      { label: "Eyebrow", token: ".type-eyebrow", sample: "Project context", note: "Uppercase, tracked, and used to set context before a heading." },
      { label: "Field label", token: ".type-label", sample: "Project budget", note: "Uppercase label text belongs with inputs, metadata, and small descriptors." },
      { label: "Controls", token: "--type-control-*", sample: "Start a project", note: "Buttons and choices share one readable control weight." },
      { label: "Metrics", token: ".type-price", sample: "$ 124,800", note: "Numbers that change use tabular figures to prevent visual jitter." },
    ],
  },
  guidance: {
    eyebrow: "Design grammar / 03",
    title: "Consistency is in the pairing.",
    lede: "Most typographic drift starts when a local element is styled in isolation. These patterns describe how the shared roles should appear next to one another.",
    pairings: [
      { label: "A section opens", heading: "Give the reader a useful landmark.", body: "A section heading gets one lede, then lets body copy or components do the detailed work.", token: "eyebrow → section → lede" },
      { label: "A card answers", heading: "A concise question", body: "Card titles should stay compact. If the explanation needs more space, the shared body role carries it without inventing a smaller heading.", token: "card title → body → compact" },
      { label: "A metric changes", heading: "$ 124,800", body: "Use tabular figures for prices, counts, dates, and live estimates so a changing digit does not shift the surrounding layout.", token: ".type-price / [data-count]" },
    ],
    prose: {
      label: "Long-form reading",
      title: "Designing for the return sweep",
      paragraphs: [
        "Long-form pages earn their rhythm through a readable measure and generous leading, not through a new family or improvised scale. The global body defaults establish the baseline; headings and ledes only create the hierarchy around it.",
        "Keep text in the existing role system, use semantic color tokens, and let the reader move through the page without encountering a new visual language in every component.",
      ],
      linkHref: "/blog",
      linkLabel: "Read the editorial implementation",
      linkIndicator: "→",
    },
    checklistAriaLabel: "Typography implementation checklist",
    checklistLabel: "Before shipping",
    checklist: [
      "Choose the role by content meaning.",
      "Use the shared type token or class.",
      "Keep headings balanced and paragraphs readable.",
      "Use tabular figures for changing values.",
      "Keep touch inputs at 1rem or above.",
    ],
  },
} as const;

/** Inferred content contract shared by the typography design route and its sections. */
export type DesignTypographyContent = typeof designTypographyContent;
