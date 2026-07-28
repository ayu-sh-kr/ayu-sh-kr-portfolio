import type { PageSeoContent } from "@app/data/seo-content.ts";

/**
 * Authored copy and catalog entries for the `/design/color` reference route.
 *
 * The page shell and its sections read this data so the token grammar remains
 * editable without mixing user-facing copy into component templates.
 */
export const designColorContent = {
  seo: {
    title: "Color design grammar | ayu-sh-kr",
    description: "A live reference for the portfolio color system and its shared usage rules.",
    keywords: ["design system", "color", "design grammar", "Dota Web"],
    ogTitle: "Color design grammar | ayu-sh-kr",
    ogDescription: "Live color roles and usage rules for the portfolio theme.",
  } satisfies PageSeoContent,
  overview: {
    eyebrow: "Design grammar / 02",
    title: "Color with a single source of truth.",
    lede: "Literal palette values live in theme.css. color.css maps the active family to semantic roles, so public components never need to name a hue or a scale step.",
    links: [
      { href: "#design-color-roles", label: "Browse the color roles", indicator: "↓" },
      { href: "/design/typography", label: "Explore typography grammar", indicator: "→" },
    ],
    summaryAriaLabel: "Color system summary",
    summaryLabel: "Shared system",
    summary: [
      { label: "Palette source", value: "src/theme.css" },
      { label: "Active family", value: "True Matcha" },
      { label: "Role source", value: "src/color.css" },
      { label: "Consumers", value: "Semantic variables only" },
    ],
    scaleAriaLabel: "Active primary color scale",
    primaryShades: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
  },
  roles: {
    eyebrow: "Semantic roles",
    title: "Choose purpose, not a shade.",
    lede: "A component should name what a color does. The token resolves the appropriate light or dark value centrally, so the same markup remains legible in either mode.",
    groups: [
      {
        name: "Canvas",
        description: "Establishes the page, elevated surfaces, and their boundaries.",
        roles: [
          { label: "Page background", token: "--background-color" },
          { label: "Surface", token: "--surface-color" },
          { label: "Surface hover", token: "--surface-hover-color" },
          { label: "Border", token: "--border-color" },
        ],
      },
      {
        name: "Content",
        description: "Builds readable hierarchy without inventing one-off text colors.",
        roles: [
          { label: "Foreground", token: "--foreground-color" },
          { label: "Muted", token: "--muted-color" },
          { label: "Muted strong", token: "--muted-strong-color" },
        ],
      },
      {
        name: "Action",
        description: "Keeps interactive primary states unified in both theme modes.",
        roles: [
          { label: "Primary", token: "--primary-color" },
          { label: "Primary hover", token: "--primary-color-hover" },
          { label: "Primary strong", token: "--primary-color-strong" },
          { label: "Primary subtle", token: "--primary-color-subtle" },
          { label: "On primary", token: "--primary-color-on" },
        ],
      },
      {
        name: "Contrast",
        description: "Provides deliberate inversion for dark panels and high-emphasis moments.",
        roles: [
          { label: "Contrast background", token: "--contrast-background-color" },
          { label: "Contrast foreground", token: "--contrast-foreground-color" },
          { label: "Contrast muted", token: "--contrast-muted-color" },
          { label: "Contrast border", token: "--contrast-border-color" },
        ],
      },
      {
        name: "Mix ramp",
        description: "Centralizes translucent lines, washes, shadows, and focus halos.",
        roles: [
          { label: "Subtle", token: "--subtle-color" },
          { label: "Border strong", token: "--border-strong-color" },
          { label: "Primary wash", token: "--primary-color-wash" },
          { label: "Primary ring", token: "--primary-color-ring" },
          { label: "Scrim", token: "--scrim-color" },
        ],
      },
      {
        name: "Status",
        description: "Communicates outcome independently from the active brand family.",
        roles: [
          { label: "Success", token: "--success-color" },
          { label: "Warning", token: "--warning-color" },
          { label: "Danger", token: "--danger-color" },
        ],
      },
    ],
  },
  guidance: {
    eyebrow: "Application rules",
    title: "Make the theme do the work.",
    lede: "These pairs are the only color relationships a component needs to express. Theme aliases select their values; component CSS stays focused on intent.",
    pairAriaLabel: "Core color-pair specimens",
    pairs: [
      { label: "Canvas / content", heading: "Readable default", token: "--background-color + --foreground-color" },
      { label: "Surface / content", heading: "Human input", token: "--surface-color + --foreground-color" },
      { label: "Action / on action", heading: "Primary action", token: "--primary-color + --primary-color-on" },
      { label: "Subtle / content", heading: "Aside or mark", token: "--primary-color-subtle + --foreground-color" },
      { label: "Contrast / content", heading: "Focused emphasis", token: "--contrast-background-color + --contrast-foreground-color" },
    ],
    rules: [
      { title: "Use semantic names", body: "Choose --muted-color for supporting copy, not a shade that only works on one surface." },
      { title: "Keep literals in the palette", body: "Add or adjust raw color values only in src/theme.css; map their meaning in src/color.css." },
      { title: "Theme state is centralized", body: "Light and dark values resolve through the same aliases. Do not add page-level theme overrides." },
      { title: "Use the mix ramp", body: "Choose --primary-color-ring or --shadow-lift instead of creating a new alpha or shadow in a component." },
    ],
  },
} as const;

/** Inferred content contract shared by the color design route and its sections. */
export type DesignColorContent = typeof designColorContent;
