import type { PageSeoContent } from "@app/data/seo-content.ts";

/** Authored copy for the toast API reference and its live interaction specimens. */
export const designToastContent = {
  seo: {
    title: "Toast design grammar | ayu-sh-kr",
    description: "A live reference for the portfolio's non-blocking toast API, timed fill, promise states, and notification rail.",
    keywords: ["design system", "toast", "notifications", "Dota Web"],
    ogTitle: "Toast design grammar | ayu-sh-kr",
    ogDescription: "Live toast API specimens for non-blocking application feedback.",
  } satisfies PageSeoContent,
  overview: {
    eyebrow: "Design grammar / 05",
    title: "It fills. It runs down. Then it is gone.",
    lede: "Toasts pass through the edge of a page without interrupting it. Their fill carries two signals at once: hue tells you what happened; its remaining length tells you how long the message will stay.",
    tagsAriaLabel: "Toast properties",
    tags: ["non-blocking", "three at a time", "swipe to dismiss", "promise API"],
  },
  showcase: {
    eyebrow: "Live specimens",
    title: "One rail, one clock, no competing signals.",
    lede: "Each trigger calls the same singleton API available to product code. Hover or focus a toast to pause its countdown; swipe it, or press Delete, Backspace, or Escape while focused to dismiss it.",
    kinds: [
      { id: "note", tone: "note", title: "Primary note", body: "The default message uses the portfolio primary fill treatment.", action: "Fire a note" },
      { id: "done", tone: "done", title: "Completed work", body: "Success is saved for the exit circle, not spread across the pill.", action: "Fire a done" },
      { id: "fail", tone: "fail", title: "Failure", body: "Failure gets a longer window and an assertive announcement.", action: "Fire a fail" },
      { id: "undo", tone: "action", title: "Action window", body: "Undo keeps its action and countdown in the same pill.", action: "Delete draft" },
      { id: "coalesce", tone: "note", title: "Coalescing", body: "Repeated IDs refresh one notification and add a counter.", action: "Save repeatedly" },
      { id: "promise", tone: "done", title: "Promise lifecycle", body: "One toast sweeps while work is pending, then settles in place.", action: "Deploy to staging" },
    ],
    positions: [
      { id: "top-left", label: "Top left" }, { id: "top-center", label: "Top center" }, { id: "top-right", label: "Top right" },
      { id: "bottom-left", label: "Bottom left" }, { id: "bottom-center", label: "Bottom center" }, { id: "bottom-right", label: "Bottom right" },
    ],
    messages: {
      note: "Copied the deploy command",
      done: "Backup finished — 412 MB",
      fail: "Couldn’t reach the mail service",
      undo: { message: "Draft deleted", label: "Undo", result: "Draft restored" },
      coalesce: "Draft saved",
      promise: { pending: "Deploying to staging", done: "Staging is live", fail: "Deployment failed" },
    },
    position: {
      eyebrow: "Rail position",
      title: "Six corners, one property.",
      lede: "Position belongs to the shared rail, so it changes where later notifications open without rebuilding the host.",
      ariaLabel: "Toast rail position",
    },
  },
  guidance: {
    eyebrow: "Use it well",
    title: "Keep feedback brief, immediate, and reversible where possible.",
    rules: [
      { label: "One fill", body: "The feathered fill is time and tone together. Do not add a competing progress bar, badge, or permanent icon." },
      { label: "One rail", body: "Use the singleton host. It keeps the stack capped at three and lets repeat work coalesce by identity." },
      { label: "One request", body: "Use Toast.promise for asynchronous work so pending, success, and failure do not create a noisy sequence." },
      { label: "One exit", body: "A timed toast collapses to its outcome; a visitor dismissal leaves immediately. Keep those causes distinct." },
    ],
  },
} as const;

/** Inferred content model consumed by the toast design-reference route. */
export type DesignToastContent = typeof designToastContent;
