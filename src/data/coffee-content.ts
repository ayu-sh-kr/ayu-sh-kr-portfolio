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
    title: "Buy Ayush a coffee | ayush.dev",
    description: "A small, one-time way to support dota, writing, talks, and independent experiments.",
    keywords: ["buy me a coffee", "support dota", "Ayush Jaiswal"],
    ogTitle: "Buy Ayush a coffee",
    ogDescription: "A small, one-time way to keep the work going.",
  },
  /** Compact pinned introduction that links directly into the order flow. */
  hero: {
    eyebrow: "Support the work",
    titleBeforeAccent: "This runs on",
    titleAccent: "caffeine.",
    titleAfterBreak: "Not VC money.",
    body: "dota, the blog, the talks — it’s one engineer and a coffee habit. If something here saved you a weekend, a coffee keeps it going.",
    primaryCta: "Buy a coffee ↓",
    secondaryCta: "See what it funds",
    trust: "One-time · no account needed · goes straight to Ayush",
  },
  /** The price at which the cup illustration is shown as full. */
  cupMaximum: 60,
  /** Fixed coffee choices that determine the current order price. */
  sizes: [
    { id: "espresso", name: "Espresso", price: 3, description: "A quick nod of thanks", featured: undefined },
    { id: "latte", name: "Latte", price: 5, description: "Standard-issue gratitude", featured: "Most picked" },
    { id: "cold-brew", name: "Cold Brew", price: 10, description: "For when it really helped", featured: undefined },
  ],
  /** Preset quantity buttons offered before an optional custom quantity. */
  quantities: [1, 3, 5],
  /** Copy surrounding the order controls, form, and demo confirmation. */
  order: {
    eyebrow: "Pick your order",
    title: "Two taps. That’s it.",
    body: "No account, no subscription trap — just a coffee, and a note if you’ve got one.",
    sizeQuestion: "Pick a size",
    quantityQuestion: "How many?",
    customLabel: "Custom",
    customHint: "coffees",
    totalEyebrow: "Your total",
    checkoutNotice: "Demo checkout — wire up Stripe, Razorpay, or UPI here. No card charged.",
    nameLabel: "Your name (optional)",
    namePlaceholder: "How should Ayush thank you?",
    noteLabel: "Leave a note (optional)",
    notePlaceholder: "A small note goes a long way.",
    submitLabel: "Complete order →",
    thanksTitle: "Thanks — truly.",
    anotherLabel: "Buy another",
  },
  /** Three independent outcomes funded by small one-time support. */
  impact: {
    eyebrow: "Where it goes",
    title: "Not a tip jar. A tank of gas.",
    items: [
      { icon: "⌘", title: "Keeps dota open source", body: "Time to make the framework clearer, faster, and more useful to the people building with it." },
      { icon: "✦", title: "Funds the experiments", body: "The prototypes, essays, and awkward first versions that turn into useful work later." },
      { icon: "☕", title: "Buys the coffee, literally", body: "A tiny ritual that gets one engineer through the long, focused parts of making things." },
    ],
  },
  /** Latest support messages shown as a lightweight, intentionally non-curated wall. */
  supporters: {
    summary: "142 coffees · $687 raised so far",
    title: "A few kind people",
    entries: [
      { name: "Mira", note: "dota made my first custom element feel obvious.", amount: "$5", when: "2 hours ago" },
      { name: "Anonymous", note: "For the blog post that saved a release.", amount: "$10", when: "Yesterday" },
      { name: "Rohan", note: "Keep writing the practical stuff.", amount: "$3", when: "3 days ago" },
      { name: "Anonymous", note: undefined, amount: "$5", when: "Last week" },
    ],
  },
  /** Final, quiet invitation back to the order controls. */
  closing: {
    title: "Enjoying the work?",
    body: "A coffee is a quick way to say so — and it genuinely helps.",
    cta: "Buy a coffee ↓",
  },
  /** Floating return-to-order action shown once a visitor has passed the hero. */
  sticky: {
    ariaLabel: "Buy a coffee",
    label: "Enjoying this?",
    cta: "Buy a coffee",
  },
} as const;

/**
 * One authored coffee option that can be selected in the support order flow.
 *
 * `CoffeeOrderComponent` resolves this union from the selected ID, then uses its
 * price and copy for the accessible total, confirmation, and cup-fill visual.
 */
export type CoffeeSize = (typeof coffeeContent.sizes)[number];
