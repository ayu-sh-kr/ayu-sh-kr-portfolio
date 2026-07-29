import type { PageSeoContent } from "@app/data/seo-content.ts";

/** Authored copy for the alert design reference and its live API specimens. */
export const designAlertContent = {
  seo: {
    title: "Alert dialog design grammar | ayu-sh-kr",
    description: "A live reference for the portfolio's native, queued alert dialog API.",
    keywords: ["design system", "alert dialog", "native dialog", "Dota Web"],
    ogTitle: "Alert dialog design grammar | ayu-sh-kr",
    ogDescription: "Live alert dialog specimens and API guidance.",
  } satisfies PageSeoContent,
  overview: {
    eyebrow: "Design grammar / 04",
    title: "The browser interruption, kept deliberate.",
    lede: "Alerts stop the page for one answer. They use native dialog behavior for focus, inert background, and focus return—then add the portfolio's visual grammar on top.",
    tags: ["native dialog", "one at a time", "promise API"],
  },
  showcase: {
    eyebrow: "Live specimens",
    title: "Three built-ins, one controlled escape hatch.",
    lede: "Every trigger below calls the real application API. A second call waits in the queue, so two questions never compete for attention.",
    items: [
      { id: "note", tone: "note", title: "Acknowledge a change", body: "One action for information that cannot wait for a quieter surface.", action: "Open note" },
      { id: "ask", tone: "ask", title: "Choose a reversible path", body: "The primary receives focus when the choice is safe to undo.", action: "Open question" },
      { id: "risk", tone: "risk", title: "Confirm an irreversible loss", body: "Cancel receives focus and the backdrop cannot dismiss the decision.", action: "Open risk" },
      { id: "prompt", tone: "ask", title: "Ask for one precise value", body: "A guard keeps the primary unavailable until the answer is useful.", action: "Open prompt" },
      { id: "custom", tone: "custom", title: "Bring your own action view", body: "A caller-owned element can use the shared controller for pending work and resolution.", action: "Open custom view" },
    ],
    dialogs: {
      note: { title: "Your session ended on another device", body: "Nothing in this tab was lost. Sign in again when you are ready.", confirm: "Got it" },
      ask: { title: "Discard this draft?", body: "Two unsaved edits will be removed.", confirm: "Discard", cancel: "Keep editing" },
      risk: { title: "Delete the staging database?", body: "Every row and seed record will be removed.", confirm: "Delete it", cancel: "Cancel" },
      prompt: {
        title: "Name this snapshot",
        body: "You will see this name in the restore list.",
        confirm: "Save snapshot",
        field: { label: "Snapshot name", hint: "40 characters max", placeholder: "pre-migration" },
      },
      custom: { ariaLabel: "Release this draft", cancelValue: "kept editing" },
    },
    resultLabel: "Last resolved value",
    emptyResult: "Choose a specimen to inspect its promise result.",
  },
  guidance: {
    eyebrow: "Use it well",
    title: "Spend interruption carefully.",
    rules: [
      { label: "Question", body: "Put the decision in the title. The supporting copy explains its consequence." },
      { label: "Queue", body: "Let the API serialize calls. Do not create a second dialog or a parallel modal layer." },
      { label: "Async", body: "Use onConfirm or controller.run for work that can fail. Pending blocks exits and keeps the question visible." },
      { label: "Custom", body: "Use Alert.custom only when caller-owned controls need behavior the built-in footer cannot express." },
    ],
  },
  custom: {
    eyebrow: "Caller-owned view",
    title: "Release this draft?",
    body: "This specimen owns its two buttons while the shared alert still owns queueing, pending state, and exit behavior.",
    cancel: "Keep editing",
    confirm: "Release draft",
  },
} as const;

/** Inferred content model consumed by the alert design route and its section components. */
export type DesignAlertContent = typeof designAlertContent;
