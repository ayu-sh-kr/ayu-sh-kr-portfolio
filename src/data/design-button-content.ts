import type { PageSeoContent } from "@app/data/seo-content.ts";

/** Authored copy for the asynchronous-action button reference and its live specimens. */
export const designButtonContent = {
  seo: {
    title: "Action button design grammar | ayu-sh-kr",
    description: "A live reference for the portfolio's typed asynchronous action-button lifecycle and visual variants.",
    keywords: ["design system", "buttons", "async actions", "Dota Web"],
    ogTitle: "Action button design grammar | ayu-sh-kr",
    ogDescription: "Live action-button specimens and guidance for applying the right interaction primitive.",
  } satisfies PageSeoContent,
  overview: {
    eyebrow: "Design grammar / 06",
    title: "One action. One lifecycle. No duplicate request.",
    lede: "Action buttons are for work that leaves the page and comes back with an outcome. The component renders that journey; a feature-owned handler does the work through a typed application event.",
    links: [
      { href: "#design-button-showcase", label: "Try the live specimens", indicator: "↓" },
      { href: "/design/color", label: "Explore the color grammar", indicator: "→" },
    ],
    summaryAriaLabel: "Action button system summary",
    summaryLabel: "Shared system",
    summary: [
      { label: "Renderer", value: "action-button" },
      { label: "Protocol", value: "action:* events" },
      { label: "Work owner", value: "Feature handler" },
      { label: "Treatments", value: "Four color variants" },
    ],
    tags: ["async work", "event-driven", "native validity", "reduced motion"],
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
    lifecycle: [
      "A feature registers a handler for the named action while it is connected.",
      "The button publishes action:trigger with its unique id and closest-form values.",
      "The dispatcher emits action:resolve or action:reject, including a 12-second timeout.",
      "The button locks while pending, announces the result, then resets after the visible settle window.",
    ],
  },
} as const;

/** Inferred content model consumed by the button design-reference route. */
export type DesignButtonContent = typeof designButtonContent;
