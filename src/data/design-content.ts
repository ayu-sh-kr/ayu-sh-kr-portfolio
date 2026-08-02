import type { PageSeoContent } from "@app/data/seo-content.ts";

/** One verified metric shown on a grammar door in the design index. */
export interface DesignGrammarFact {
  /** Numeric or short count that visitors can verify on the destination route. */
  value: string;
  /** Unit that gives the count its meaning below the tabular value. */
  label: string;
}

/** A route door that opens one live design reference. */
export interface DesignGrammarDoor {
  /** Application route that owns the referenced grammar surface. */
  href: string;
  /** A concise description of the decision this destination settles. */
  description: string;
  /** Source file or token layer that helps maintainers locate the implementation. */
  source: string;
  /** Facts from the destination route or its shared contract. */
  facts: readonly DesignGrammarFact[];
}

/** One of the five decision layers introduced by the design index. */
export interface DesignGrammarSection {
  /** Stable page fragment used by the section rail and scroll observer. */
  id: string;
  /** Fixed grammar number; notification deliberately shares its number across two doors. */
  number: string;
  /** Visible name of the grammar layer. */
  title: string;
  /** Context that explains when a maintainer should open this grammar. */
  lede: string;
  /** One or two destination doors belonging to the grammar layer. */
  doors: readonly DesignGrammarDoor[];
  /** Verified destination fragments that complement, but never nest inside, the door link. */
  jumps: readonly { href: string; label: string }[];
}

/** A responsibility boundary between the five design grammars. */
export interface DesignGrammarOwnership {
  /** Grammar layer being described. */
  layer: string;
  /** Decisions this layer is the sole source of truth for. */
  owns: string;
  /** Concerns that must remain in another grammar. */
  excludes: string;
  /** Primary source a maintainer should inspect for the rule. */
  source: string;
}

/**
 * Authored content for the `/design` grammar index.
 *
 * The route shell, opening hero, and reference section all consume this model.
 * It deliberately groups the existing `/design/*` routes into five decision
 * layers, so a maintained reference can point to live implementation rather
 * than duplicating its rules in an index page.
 */
export const designContent = {
  seo: {
    title: "Design grammar index | ayu-sh-kr",
    description: "A map of the five design grammars behind the portfolio: components and colour, typography, interaction, layout, and notification.",
    keywords: ["design system", "design grammar", "components", "typography", "interaction", "layout", "notification"],
    ogTitle: "Design grammar index | ayu-sh-kr",
    ogDescription: "Five live design references, one shared vocabulary.",
  } satisfies PageSeoContent,
  hero: {
    eyebrow: "Design grammar · 00",
    title: {
      opening: "Five grammars.",
      accent: "One vocabulary.",
      closing: "Start here.",
    },
    lede: "Every page on this site is assembled from five decision layers. Each has a live reference route and answers one class of question. This is the bridge between them: what each layer settles, and where to look when two rules seem to disagree.",
    factsAriaLabel: "Design grammar summary",
    facts: ["5 grammars", "4 token layers", "2 colour modes", "1 primary font"],
  },
  index: {
    rail: {
      ariaLabel: "Design index sections",
      structureLabel: "Structure",
      behaviourLabel: "Behaviour",
      contractLabel: "Contract",
      contractLinks: [
        { href: "#map", label: "06 · Who owns what" },
        { href: "#routes", label: "07 · Where to start" },
        { href: "#ship", label: "08 · Ship" },
      ],
    },
    labels: {
      sectionNavigationPrefix: "Sections inside",
      jump: "Jump to",
      doorPurpose: "What it settles",
      doorAction: "Open the page",
      grammarPrefix: "Grammar",
    },
    ownership: {
      number: "06",
      title: "Who owns what",
      lede: "Each layer owns one kind of decision and is forbidden the others. If two grammars appear to disagree, a rule has crossed a boundary rather than created a real conflict.",
      ariaLabel: "Design grammar ownership",
      headers: ["Layer", "Owns", "Never touches", "Source"],
      note: {
        ariaLabel: "Order of precedence",
        label: "Order of precedence",
        body: "Build in reading order: layout places things, typography shapes the reading, components give surfaces their meaning, interaction defines response, and notification reports what happened. A later layer may consume an earlier token; it may never redefine it.",
        warning: "When two grammars disagree, neither wins.",
        resolution: "Move the rule to the layer that owns it instead of adding an override.",
      },
    },
    routes: {
      number: "07",
      title: "Where to start",
      lede: "Five common tasks and the shortest useful reading order. Nobody needs all five grammar pages at once.",
    },
    ship: {
      number: "08",
      title: "Before it ships",
      lede: "The shared floor that catches drift before a route adds its own more specific checks.",
      accentWarning: "Accent is scarce.",
      accentResolution: "If the primary colour is decorating rather than identifying one meaningful thing, take it out.",
      actions: [
        { href: "/design/element", label: "Open 01 components & colour", className: "app-link app-link--button app-link--ink" },
        { href: "#components", label: "Back to the top", className: "app-link app-link--button app-link--ghost" },
      ],
    },
  },
  sections: [
    {
      id: "components",
      number: "01",
      title: "Components & colour",
      lede: "The parts bin and its paint. Reuse the production controls before inventing a local treatment, and let semantic roles resolve colours in both themes instead of naming a hue inside a component.",
      doors: [
        {
          href: "/design/element",
          description: "The controls and destinations a page can contain, with the colour roles that keep them coherent.",
          source: "src/components/pages/design/element · src/color.css",
          facts: [
            { value: "4", label: "action tones" },
            { value: "4", label: "button states" },
            { value: "6", label: "colour groups" },
          ],
        },
      ],
      jumps: [
        { href: "/design/color#design-color-roles", label: "Colour roles" },
        { href: "/design/element#design-element-button-showcase", label: "Action buttons" },
        { href: "/design/element#design-element-anchor-showcase", label: "Anchor links" },
        { href: "/design/element#design-element-guidance", label: "Control guidance" },
      ],
    },
    {
      id: "typography",
      number: "02",
      title: "Typography",
      lede: "The system stack and the roles that make scanning predictable. The scale carries display, section, supporting, and control work without downloading a typeface or inventing a local size.",
      doors: [
        {
          href: "/design/typography",
          description: "How every piece of text is sized, weighted, tracked, and led so pages keep their hierarchy.",
          source: "src/typography.css · /design/typography",
          facts: [
            { value: "12", label: "type roles" },
            { value: "6", label: "fluid tiers" },
            { value: "6", label: "fixed roles" },
            { value: "1", label: "primary font" },
          ],
        },
      ],
      jumps: [
        { href: "/design/typography#design-roles", label: "Role specimens" },
        { href: "/design/typography", label: "Typography overview" },
      ],
    },
    {
      id: "interaction",
      number: "03",
      title: "Interaction",
      lede: "Nine families of behaviour and sixteen approved verbs. Every specimen is live: hover it, focus it, scroll it, or reduce motion. If an interaction does not belong to a family, it is drift.",
      doors: [
        {
          href: "/design/interaction",
          description: "How anything here may move, what may trigger it, and how long it is allowed to take.",
          source: "src/components/pages/design/interaction",
          facts: [
            { value: "9", label: "families" },
            { value: "16", label: "verbs" },
            { value: "6", label: "durations" },
            { value: "1", label: "focus ring" },
          ],
        },
      ],
      jumps: [
        { href: "/design/interaction#pointer", label: "Pointer" },
        { href: "/design/interaction#focus", label: "Focus" },
        { href: "/design/interaction#action", label: "Action" },
        { href: "/design/interaction#timing", label: "Timing" },
        { href: "/design/interaction#reduced", label: "Reduced motion" },
      ],
    },
    {
      id: "layout",
      number: "04",
      title: "Layout",
      lede: "Geometry only: measure, spacing, rhythm, grids, radius, and stacking order. It owns where things sit, never the colour, border, or type scale of the surfaces that sit there.",
      doors: [
        {
          href: "/design/layout",
          description: "Where things sit, how far apart they sit, and what happens to that geometry as the window changes.",
          source: "src/layout.css · /design/layout",
          facts: [
            { value: "4", label: "measures" },
            { value: "10", label: "space steps" },
            { value: "3", label: "breakpoints" },
            { value: "7", label: "z-levels" },
          ],
        },
      ],
      jumps: [
        { href: "/design/layout#design-layout-overview", label: "Page frame" },
        { href: "/design/layout#design-layout-roles", label: "Measures" },
        { href: "/design/layout#design-layout-primitives", label: "Primitives" },
        { href: "/design/layout#design-layout-guidance", label: "Guidance" },
      ],
    },
    {
      id: "notification",
      number: "05",
      title: "Notification",
      lede: "Two surfaces for two jobs. A toast reports an outcome and leaves in its own time; an alert stops the page for an answer. Neither should interrupt work that is already underway without cause.",
      doors: [
        {
          href: "/design/toast",
          description: "What the site says back after it has already done the thing.",
          source: "src/service/toast.service.ts · /design/toast",
          facts: [
            { value: "3", label: "toast flows" },
            { value: "6", label: "rail positions" },
            { value: "1", label: "undo window" },
          ],
        },
        {
          href: "/design/alert",
          description: "What the site asks before it does something that cannot be taken back.",
          source: "src/service/alert.service.ts · /design/alert",
          facts: [
            { value: "3", label: "tones" },
            { value: "1", label: "native dialog" },
            { value: "1", label: "focus trap" },
          ],
        },
      ],
      jumps: [
        { href: "/design/toast#design-toast-showcase", label: "Toast specimens" },
        { href: "/design/toast#design-toast-guidance", label: "Toast guidance" },
        { href: "/design/alert#design-alert-showcase", label: "Alert specimens" },
        { href: "/design/alert#design-alert-guidance", label: "Alert guidance" },
      ],
    },
  ] satisfies readonly DesignGrammarSection[],
  ownership: [
    { layer: "Layout", owns: "Measure, spacing, rhythm, grids, radius value, and z-order.", excludes: "Colour, border, shadow, background, and type size.", source: "src/layout.css" },
    { layer: "Typography", owns: "Size, weight, tracking, leading, and measure cap.", excludes: "Position, padding, and a surface’s colour.", source: "src/typography.css" },
    { layer: "Components & colour", owns: "Surfaces, controls, semantic colour, borders, and shadows.", excludes: "Its own measures or type scale.", source: "/design/element · src/color.css" },
    { layer: "Interaction", owns: "State change over time: curve, duration, trigger, and verb.", excludes: "Static appearance at rest.", source: "/design/interaction" },
    { layer: "Notification", owns: "What the system says back and for how long.", excludes: "Anything a person asked for directly.", source: "/design/toast · /design/alert" },
  ] satisfies readonly DesignGrammarOwnership[],
  routes: [
    { task: "Building a new page from nothing", path: "Start with 04 layout for the container and rhythm, then 02 typography for the hero trio, then 01 components & colour for what lives inside." },
    { task: "Adding one section to a page that exists", path: "Open 04 layout only. Reuse the neighbouring section’s container, rhythm, and grid before adding a local rule." },
    { task: "A control that does work when clicked", path: "Read 01 components & colour for the action lifecycle, then 05 notification for the outcome. Navigation anchors and async buttons are not substitutes." },
    { task: "Something is moving and it feels wrong", path: "Open 03 interaction. Check its trigger, one intended verb, duration, and reduced-motion behaviour before changing the visual treatment." },
    { task: "Reviewing an existing page for drift", path: "Read 02 typography and 04 layout. Both make the shared contracts visible before a page-level override turns into a second system." },
  ],
  checks: [
    "Exactly one display heading opens a page, and one primary action is enough for a view.",
    "Use the shared typography, layout, and semantic colour tokens; do not add raw local values for the same job.",
    "Nested radii step down from their parent instead of repeating the same corner value.",
    "Keep one motion idea per section and mirror any motion with a reduced-motion rule.",
    "Verify keyboard focus, target size, light and dark themes, and forced-colors contrast.",
    "Check 320px, 768px, 1440px, and 200% zoom with no horizontal scrollbar.",
  ],
} as const;

/** Inferred content contract consumed by the design-index route and its private sections. */
export type DesignContent = typeof designContent;
