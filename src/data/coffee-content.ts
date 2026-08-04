/**
 * Authored content for the one-time coffee support route.
 *
 * The routed page and its section components read this module so the available
 * coffee sizes, supporter wall, and conversion copy have one source of truth.
 * Replacing the demo checkout later changes the `checkoutNotice` only; the UI
 * state and order calculation remain independent from a payment provider.
 */
export const coffeeContent = {
  /** Metadata used by the routed page to describe this support surface. */
  seo: {
    title: "Support independent engineering work | ayu-sh-kr.com",
    description: "A demonstration of one-time support for Dota, technical writing, and independent engineering work.",
    keywords: ["support open source", "Dota", "independent engineering", "Ayush Kumar"],
    ogTitle: "Support independent engineering work",
    ogDescription: "One-time support for Dota maintenance, technical writing, and independent experiments.",
  },
  /** Compact pinned introduction that links directly into the order flow. */
  hero: {
    eyebrow: "Support the work",
    titleBeforeAccent: "Support the",
    titleAccent: "independent work.",
    titleAfterBreak: "Dota, writing, and practical experiments.",
    body: "This is a one-time support page for the maintenance of Dota, technical writing, and independent engineering work. The checkout shown here is currently a demonstration and does not collect payment.",
    primaryCta: "Review support options ↓",
    secondaryCta: "See what support funds",
    trust: "One-time support · no account required · demonstration checkout",
  },
  /** The price at which the cup illustration is shown as full. */
  cupMaximum: 60,
  /** Fixed coffee choices that determine the current order price. */
  sizes: [
    { id: "espresso", name: "Espresso", price: 3, description: "A small one-time contribution", featured: undefined },
    { id: "latte", name: "Latte", price: 5, description: "A standard support option", featured: "Common choice" },
    { id: "cold-brew", name: "Cold Brew", price: 10, description: "A larger one-time contribution", featured: undefined },
  ],
  /** Preset quantity buttons offered before an optional custom quantity. */
  quantities: [1, 3, 5],
  /** Copy surrounding the order controls, form, and demo confirmation. */
  order: {
    eyebrow: "Choose support",
    title: "Select a one-time amount.",
    body: "Choose an amount and, if useful, leave a note. The current flow is a checkout demonstration; no payment information is requested or stored.",
    sizeQuestion: "Choose an amount",
    quantityQuestion: "Quantity",
    customLabel: "Custom",
    customHint: "coffees",
    totalEyebrow: "Your total",
    checkoutNotice: "Demonstration checkout only. No payment is collected.",
    nameLabel: "Your name (optional)",
    namePlaceholder: "How should the acknowledgement be addressed?",
    noteLabel: "Leave a note (optional)",
    notePlaceholder: "Add a short note if you would like to.",
    submitLabel: "Preview support →",
    thanksTitle: "Support preview complete.",
    anotherLabel: "Review another option",
  },
  /** Three independent outcomes funded by small one-time support. */
  impact: {
    eyebrow: "Where it goes",
    title: "What one-time support can sustain.",
    items: [
      { icon: "⌘", title: "Dota maintenance", body: "Time for documentation, examples, fixes, and releases across the Dota web-component libraries." },
      { icon: "✦", title: "Technical writing and experiments", body: "Space to document engineering decisions and test focused ideas before they become reusable work." },
      { icon: "☕", title: "Independent engineering time", body: "A modest contribution to the time and tools required to maintain public work alongside client delivery." },
    ],
  },
  /** Verified support activity replaces the empty state when a payment provider is connected. */
  supporters: {
    summary: "Verified contributions will appear here after checkout is connected.",
    title: "Support activity",
    entries: [] as readonly { name: string; note?: string; amount: string; when: string }[],
  },
  /** Final, quiet invitation back to the order controls. */
  closing: {
    title: "Has this work been useful?",
    body: "Review the one-time support options if you would like to contribute to ongoing Dota maintenance and independent engineering work.",
    cta: "Review support options ↓",
  },
  /** Floating return-to-order action shown once a visitor has passed the hero. */
  sticky: {
    ariaLabel: "Review support options",
    label: "Support the work",
    cta: "Review options",
  },
} as const;

/**
 * One authored coffee option that can be selected in the support order flow.
 *
 * `CoffeeOrderComponent` resolves this union from the selected ID, then uses its
 * price and copy for the accessible total, confirmation, and cup-fill visual.
 */
export type CoffeeSize = (typeof coffeeContent.sizes)[number];
