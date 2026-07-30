import type { PageSeoContent } from "@app/data/seo-content.ts";

/** Authored copy for the design-element reference and its live button and anchor-link specimens. */
export const designElementContent = {
  seo: {
    title: "Action control design grammar | ayu-sh-kr",
    description: "A live reference for the portfolio's asynchronous action buttons and shared anchor-link variants.",
    keywords: ["design system", "buttons", "anchor links", "async actions", "Dota Web"],
    ogTitle: "Action control design grammar | ayu-sh-kr",
    ogDescription: "Live action-button and anchor-link specimens for choosing the right interaction primitive.",
  } satisfies PageSeoContent,
  overview: {
    eyebrow: "Design grammar / 06",
    title: "One action. One lifecycle or destination.",
    lede: "Action buttons are for work that leaves the page and comes back with an outcome. Anchor links move people to a destination. Both share a predictable visual grammar without pretending their semantics are the same.",
    links: [
      { href: "#design-element-button-showcase", label: "Try the live button specimens", indicator: "↓" },
      { href: "#design-element-anchor-showcase", label: "Explore anchor-link variants", indicator: "↓" },
      { href: "/design/color", label: "Explore the color grammar", indicator: "→" },
    ],
    summaryAriaLabel: "Action control system summary",
    summaryLabel: "Shared system",
    summary: [
      { label: "Renderer", value: "action-button" },
      { label: "Protocol", value: "action:* events" },
      { label: "Work owner", value: "Feature handler" },
      { label: "Anchor grammar", value: "app-link classes" },
    ],
    tags: ["async work", "anchor navigation", "native validity", "reduced motion"],
  },
  showcase: {
    eyebrow: "Live specimens",
    title: "Four tones, one geometry, four states.",
    lede: "Each button below is the production component. It ignores repeat triggers while pending, settles in place, announces the outcome, and then returns to its idle label.",
    actions: [
      { id: "publish", action: "design.button.publish", variant: "accent", title: "Primary work", body: "Use when the user is committing the main task on a surface.", label: "Publish note", busyLabel: "Publishing…", doneLabel: "Published", failLabel: "Try again" },
      { id: "save", action: "design.button.save", variant: "ink", title: "Strong secondary work", body: "Use when the task matters but should not take the accent role.", label: "Save draft", busyLabel: "Saving…", doneLabel: "Saved", failLabel: "Try again" },
      { id: "check", action: "design.button.check", variant: "ghost", title: "Low-emphasis work", body: "Use for a useful action that should sit quietly beside a stronger choice.", label: "Check status", busyLabel: "Checking…", doneLabel: "Checked", failLabel: "Try again" },
      { id: "remove", action: "design.button.remove", variant: "danger", title: "Destructive work", body: "Use only for an irreversible or high-consequence action. This specimen rejects to show recovery.", label: "Remove draft", busyLabel: "Removing…", doneLabel: "Removed", failLabel: "Could not remove" },
    ],
  },
  anchorLinks: {
    eyebrow: "Anchor link variants",
    title: "One destination. One dependable treatment.",
    lede: "These are real anchors, so their href keeps routing and hash navigation intact. The shared classes cover button-shaped calls to action, underlined prose links, card-footer links, and navigation density without changing the underlying semantics.",
    actions: [
      { id: "accent", variant: "accent", title: "Accent destination", body: "The primary route or hash destination in a group of actions.", label: "Start a project", href: "/pricing#pricing-start-project", classes: "app-link--button app-link--accent" },
      { id: "ink", variant: "ink", title: "Ink destination", body: "A strong route that should not take the selected primary colour role.", label: "Browse case studies", href: "/showcase", classes: "app-link--button app-link--ink" },
      { id: "ghost", variant: "ghost", title: "Ghost destination", body: "A quiet secondary route beside a stronger navigation choice.", label: "Explore color roles", href: "/design/color", classes: "app-link--button app-link--ghost" },
      { id: "compact", variant: "compact", title: "Compact destination", body: "Reserved for floating sticky controls where the surrounding chrome owns the compact space.", label: "Jump to guidance", href: "#design-element-guidance", classes: "app-link--button app-link--accent app-link--compact" },
      { id: "full", variant: "full", title: "Full-width destination", body: "For a constrained panel where one anchor should fill its available inline space.", label: "Read the guidance", href: "#design-element-guidance", classes: "app-link--button app-link--ink app-link--full" },
    ],
    navigation: {
      eyebrow: "Navigation density",
      title: "The same anchor foundation, without CTA semantics.",
      lede: "Navigation links keep a lower-emphasis, context-appropriate target while retaining the shared focus and reduced-motion behavior.",
      items: [
        { id: "nav", title: "Standard navigation", body: "For a dense header or footer destination.", label: "Go to pricing", href: "/pricing", classes: "app-link--nav" },
        { id: "nav-mobile", title: "Mobile navigation", body: "For the full-width row inside a compact navigation menu.", label: "Visit the blog", href: "/blog", classes: "app-link--nav app-link--nav-mobile" },
      ],
    },
    text: {
      eyebrow: "Text-link variants",
      title: "Inline reading needs a visible, underlined destination.",
      lede: "Text links stay in the sentence flow and use an accent underline. The muted variant is for supporting copy that should remain discoverable without competing with the primary content.",
      items: [
        { id: "text", title: "Default text link", before: "Read the", label: "project brief", after: " before choosing a collaboration path.", href: "/pricing", classes: "app-link--text" },
        { id: "text-muted", title: "Muted text link", before: "Need a lower-emphasis route?", label: "Visit the support desk", after: " for help and common answers.", href: "/support", classes: "app-link--text app-link--text-muted" },
      ],
    },
    cards: {
      eyebrow: "Card-footer variants",
      title: "A card can end with linked text, not a second button.",
      lede: "Use this treatment when the card itself provides context and its final destination should stay lightweight. The shared card modifier preserves a comfortable target without inventing button semantics.",
      items: [
        { id: "card", title: "Standard card destination", body: "A project, article, or resource card can reserve its final line for one clear route.", label: "Browse case studies", href: "/showcase", classes: "app-link--text app-link--card" },
        { id: "card-muted", title: "Muted card destination", body: "Use the quieter tone when the card’s title and summary should carry the first level of emphasis.", label: "Read the latest notes", href: "/blog", classes: "app-link--text app-link--text-muted app-link--card" },
      ],
    },
  },
  guidance: {
    eyebrow: "Choose the right control",
    title: "“Looks like a button” is not enough of a rule.",
    lede: "The audit groups controls by behavior before styling. This prevents a navigation link, a filter pill, and a server action from sharing misleading semantics just because they have a rounded outline.",
    groups: [
      { label: "Async action-button", use: "Starts work and waits for a result.", examples: "Blog subscription and offline retry.", rule: "Give it a unique id, action handler, matching labels, and a guard when form prerequisites apply." },
      { label: "Navigation link", use: "Changes URL or moves to a destination.", examples: "Hero CTAs, article reads, and “back home” links.", rule: "Keep a real anchor with href. Its visual treatment may be button-like, but its semantics remain navigation." },
      { label: "Choice control", use: "Changes selected state without performing remote work.", examples: "Blog filters, coffee size, price options, and FAQ categories.", rule: "Keep native buttons, radios, or selects with pressed/checked state. Do not add pending or success messaging." },
      { label: "Utility control", use: "Opens, closes, copies, or toggles local UI.", examples: "Header menu, dark mode, copy code, and file removal.", rule: "Use an explicit native control with an accessible name and state; it is not a request lifecycle." },
    ],
    lifecycle: {
      eyebrow: "Event path",
      title: "A named action settles in four steps.",
      lede: "The async button’s visual states reflect a real application lifecycle rather than a local animation.",
      steps: [
        "A feature registers a handler for the named action while it is connected.",
        "The button publishes action:trigger with its unique id and closest-form values.",
        "The dispatcher emits action:resolve or action:reject, including a 12-second timeout.",
        "The button locks while pending, announces the result, then resets after the visible settle window.",
      ],
    },
  },
} as const;

/** Inferred content model consumed by the design-element reference route. */
export type DesignElementContent = typeof designElementContent;
