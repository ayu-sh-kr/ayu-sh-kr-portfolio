import type { PageSeoContent } from "@app/data/seo-content.ts";

/**
 * One interaction family in the design grammar.
 *
 * The dictionary renders these records into the section navigation and specimen
 * cards. Keeping the shared numbering and vocabulary here lets future routes
 * link to a stable rule instead of recreating a local interpretation.
 */
export interface InteractionFamily {
  /** Stable anchor and fragment used by the table of contents. */
  id: string;
  /** Visible grammar number, ordered by the moment that triggers the behaviour. */
  number: string;
  /** Navigation group that explains whether a person or the system initiated the change. */
  group: "Input" | "Commitment" | "Response";
  /** Short section heading used in the page and the rail. */
  title: string;
  /** Constraint that makes the family recognisable and prevents visual drift. */
  rule: string;
}

/**
 * A named motion verb approved for interaction work.
 *
 * The interaction dictionary shows every entry as a playable stage. New
 * interaction work must select one of these verbs before it introduces motion.
 */
export interface InteractionVerb {
  /** Verb shown in the specimen heading. */
  name: string;
  /** Timing or spatial value that accompanies the live stage. */
  value: string;
  /** Concise explanation of the change the verb communicates. */
  description: string;
}

/** Authored source for the `/design-interaction` interaction grammar route. */
export const designInteractionContent = {
  seo: {
    title: "Interaction design grammar | ayu-sh-kr",
    description: "A live dictionary of the portfolio's interaction triggers, motion verbs, feedback, and accessibility contracts.",
    keywords: ["design system", "interaction design", "motion", "accessibility", "Dota Web"],
    ogTitle: "Interaction design grammar | ayu-sh-kr",
    ogDescription: "Live interaction specimens and implementation rules for the portfolio.",
  } satisfies PageSeoContent,
  families: [
    { id: "pointer", number: "01", group: "Input", title: "Pointer", rule: "Hover is garnish: lift or nudge, never both." },
    { id: "focus", number: "02", group: "Input", title: "Focus", rule: "One visible ring keeps keyboard state unmistakable." },
    { id: "scroll", number: "03", group: "Input", title: "Scroll", rule: "One passive listener feeds one frame of page state." },
    { id: "selection", number: "04", group: "Commitment", title: "Selection", rule: "Selection is colour and a mark, not a pop." },
    { id: "ingest", number: "05", group: "Commitment", title: "Ingest", rule: "A drop zone is the only dashed non-element." },
    { id: "action", number: "06", group: "Response", title: "Action", rule: "A state machine reports work; it never strands it." },
    { id: "recompute", number: "07", group: "Response", title: "Recompute", rule: "Only the value that changed is marked." },
    { id: "transient", number: "08", group: "Response", title: "Transient", rule: "Toast passes; dialog blocks." },
    { id: "interrupt", number: "09", group: "Response", title: "Interrupt", rule: "Native dialog owns the top layer and focus." },
  ] satisfies readonly InteractionFamily[],
  verbs: [
    { name: "fade", value: ".2s opacity", description: "Bring a settled layer into attention." },
    { name: "lift", value: "−2px · .25s", description: "Confirm a reachable surface." },
    { name: "nudge", value: "+4px · .25s", description: "Move a trailing mark toward its destination." },
    { name: "press", value: ".97 · .12s", description: "Acknowledge contact without changing meaning." },
    { name: "deepen", value: "colour · .2s", description: "Strengthen a filled control on intent." },
    { name: "draw", value: ".35s", description: "Complete a success or failure glyph." },
    { name: "rotate", value: "45° · .3s", description: "Turn a disclosure mark; do not swap it." },
    { name: "reveal", value: ".7s once", description: "Introduce content at its reading moment." },
    { name: "settle", value: ".42s", description: "Land a measure after its value changes." },
    { name: "sweep", value: ".35s", description: "Move through a skeleton while content is absent." },
    { name: "retract", value: ".42s", description: "Spend remaining time from a transient message." },
    { name: "collapse", value: ".42s", description: "Remove a completed temporary surface." },
    { name: "expand", value: ".42s", description: "Open to a measured, real ceiling." },
    { name: "scrub", value: "stage-relative", description: "Travel across a constrained progress track." },
    { name: "spin", value: "linear", description: "Indicate a known, short pending state." },
    { name: "ping", value: ".7s once", description: "Call attention to a new passive signal." },
  ] satisfies readonly InteractionVerb[],
  hero: {
    eyebrow: "Design grammar / 06",
    title: { opening: "Nine triggers.", accent: "Sixteen verbs.", closing: "No drift." },
    lede: "Every interactive behaviour in this portfolio belongs to one of nine families. Look up the rule, its value, and the production component that represents it before adding a new interaction.",
    tagsAriaLabel: "Dictionary summary",
    tags: ["9 families", "1 spatial curve", "6 durations", "1 focus ring", "16 verbs"],
  },
  navigation: {
    ariaLabel: "Interaction grammar sections",
    groups: ["Input", "Commitment", "Response"] as const,
    contract: { href: "#timing", label: "10–15 · Contract" },
  },
  pointer: {
    eyebrow: "01 / Input",
    title: "Pointer response",
    lede: "Hover confirms reachability; it never carries information. Each specimen uses the same control shape and focus treatment as the app.",
    specimens: [
      { label: "Lift", value: "translateY(−2px) · .25s" },
      { label: "Deep lift", value: "−4px + shadow · .35s" },
      { label: "Ink-up", value: "colour only · .2s" },
      { label: "Wash", value: "surface tint · .25s" },
      { label: "Nudge", value: "mark +4px · .25s" },
      { label: "Press", value: "scale(.97) · .12s" },
    ],
    do: {
      label: "Do",
      href: "#ship",
      linkLabel: "Case study · Sacrena",
      body: "Border inks up; the arrow nudges. One parent state, one child move.",
    },
    never: {
      label: "Never",
      rowLabel: "Case study · Sacrena",
      body: "Row lift plus arrow travel reads as two objects coming apart.",
    },
  },
  focus: {
    eyebrow: "02 / Input",
    title: "Focus and keyboard",
    lede: "One 2px primary ring, with offsets chosen by the surface it must clear. A background change does not replace it.",
    specimens: [
      { label: "Offset 3px", href: "#pointer", control: "Pill chrome", body: "Links and rounded controls have paper to spare." },
      { label: "Offset 2px", inputAriaLabel: "Field focus specimen", inputValue: "A field", control: "A card in a grid", body: "Fields and packed cards clear their neighbours without touching them." },
      { label: "Offset −2px", control: "A full-bleed row", body: "Rows and summaries place the ring inside their edge." },
    ],
    note: {
      title: "Keyboard contract",
      body: "Tab reaches every control in document order. The shared alert resolves Escape and returns focus to its opener; destructive confirmation opens on Cancel.",
    },
  },
  scroll: {
    eyebrow: "03 / Input",
    title: "Scroll response",
    lede: "Reading state is shared: route progress, header hairline, scrollspy and a pin use one passive listener, one frame, and one render pass.",
    specimens: [
      { label: "Reveal", stage: "Fades up once", body: ".7s / threshold .12 / observer stops after entry." },
      { label: "Read progress", body: "Per-frame width has no transition, so it stays attached to reading." },
      { label: "Pin", stage: "56svh demo pin", body: "A short specimen only. Production pins use 100vh." },
    ],
  },
  selection: {
    eyebrow: "04 / Commitment",
    title: "Selection and disclosure",
    lede: "Selection owns colour and a mark. Hover owns transform. Those properties never compete.",
    choices: ["Structured brief", "Prototype review", "Build handoff"],
    selectedLabel: "Selected",
    chooseLabel: "Choose this",
    disclosure: {
      summary: "What does a disclosure do?",
      body: "It opens to a real measured ceiling. The plus rotates 45 degrees, so the mark keeps its identity instead of swapping to a minus.",
    },
  },
  ingest: {
    eyebrow: "05 / Commitment",
    title: "Ingest",
    lede: "The only dashed non-element is a drop zone. It accepts a file, confirms it with a chip, then hands work to the action lifecycle.",
    label: "Drop zone",
    emptyTitle: "A concise brief belongs here",
    acceptedTitle: "File accepted",
    acceptLabel: "Accept a sample file",
    clearLabel: "Clear specimen",
    filesAriaLabel: "Accepted files",
    removeAriaLabel: "Remove {name}",
    removeLabel: "Remove",
    sampleName: "interaction-map.pdf",
  },
  action: {
    eyebrow: "06 / Response",
    title: "Action lifecycle",
    lede: "The production action button owns idle, pending, success, error, and each terminal return. Product work supplies a handler; it never hand-builds a state machine.",
    specimens: [
      {
        label: "Resolved work",
        title: "Publisher-owned success",
        body: "Pending, success and the 2.2 second return belong to the shared component.",
        button: { label: "Publish", busyLabel: "Publishing…", doneLabel: "Published" },
      },
      {
        label: "Rejected work",
        title: "A recoverable failure",
        body: "Failure remains visible for 2.6 seconds, then the same action is ready to retry.",
        button: { label: "Test recovery", busyLabel: "Testing…", failLabel: "Try again" },
      },
    ],
  },
  recompute: {
    eyebrow: "07 / Response",
    title: "Live recomputation",
    lede: "Human input stays on a light card. Numbers and breakdown live on the contrast panel. One polite sentence carries the update.",
    inputLabel: "Review days",
    investmentLabel: "Estimated investment",
    currency: "₹",
    initialInvestment: "₹5,400",
    daySummary: "{days} days at ₹1,800",
  },
  transient: {
    eyebrow: "08 / Response",
    title: "Transient feedback",
    lede: "The app's toast is an ink pill that passes. A dialog is a centred surface that blocks. Repeated work coalesces; natural expiry and hand dismissal are different exits.",
    controls: {
      note: { label: "Fire a note", message: "Grammar link copied" },
      success: { label: "Fire success", message: "Interaction contract saved" },
      error: { label: "Fire error", message: "The action could not be completed" },
    },
  },
  interrupt: {
    eyebrow: "09 / Response",
    title: "Interruption",
    lede: "Use the shared native dialog. It owns the top layer, focus trap, inert background, Escape exit, and focus return without a parallel overlay.",
    buttonLabel: "Open risk-tone dialog",
    dialog: {
      title: "Publish this case study?",
      body: "It becomes visible at its public URL immediately.",
      confirm: "Publish",
      cancel: "Cancel",
    },
  },
  timing: {
    eyebrow: "10 / Contract",
    title: "Timing and easing",
    lede: "Six durations prevent timing from becoming a page-by-page aesthetic choice. Movement gets the spatial curve; opacity gets ease; per-frame values get linear.",
    durations: [
      { duration: ".12s", use: "Press or per-frame value" },
      { duration: ".2s", use: "Colour only" },
      { duration: ".25s", use: "Default move under 8px" },
      { duration: ".3–.35s", use: "Glyph or mark rotation" },
      { duration: ".42–.55s", use: "Changing measure" },
      { duration: ".7s", use: "One-time reveal ceiling" },
    ],
  },
  verbReference: {
    eyebrow: "11 / Contract",
    title: "The verb list",
    lede: "A verb is playable in a 44px stage. If it needs a wider story, it is a composition—not a new motion primitive.",
  },
  compound: {
    eyebrow: "12 / Contract",
    title: "Compounding",
    lede: "Composition has a sequence, a purpose, and a stop: submit → pending → settled action → transient confirmation. Each stage keeps its own rule.",
    steps: [
      "Commit an explicit choice.",
      "Report asynchronous work through the action lifecycle.",
      "Pass the outcome through a bounded toast.",
    ],
  },
  reduced: {
    eyebrow: "13 / Contract",
    title: "Reduced motion",
    lede: "Reduced motion removes movement, never information. A spinner becomes a half ring, a check is fully drawn, and a pin becomes ordinary content.",
    previewLabel: "Preview reduced motion",
    activeLabel: "Review still states",
  },
  guardrails: {
    eyebrow: "14 / Contract",
    title: "Never",
    lede: "The grammar is intentionally small. Constraints are part of the interface contract, not an optional aesthetic preference.",
    firstItem: {
      before: "Never use ",
      code: "transition: all",
      after: "; declare the changing property.",
    },
    items: [
      "Never make hover the only way to learn a state.",
      "Never add a duration playground; it invites unapproved values.",
      "Never create a new verb because a composition has not been named.",
    ],
  },
  checklist: {
    eyebrow: "15 / Contract",
    title: "Ship checklist",
    lede: "Every new behaviour needs a family, a verb, a live specimen, and the same access to its meaning without motion.",
    items: [
      "Name the trigger before writing the interaction.",
      "Choose one of the sixteen verbs and its approved value.",
      "Add a live specimen with its rule and use case.",
      "Verify keyboard, touch, 320px, landscape phone, 200% zoom, and reduced motion.",
      "Confirm async work has a pending timeout, cancellation path, and settled outcome.",
    ],
  },
} as const;

/** Inferred content contract consumed by the interaction route and its dictionary element. */
export type DesignInteractionContent = typeof designInteractionContent;
