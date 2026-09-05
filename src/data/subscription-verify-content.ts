import type { PageSeoContent } from "@app/data/seo-content.ts";

/** Authored copy for the token-linked newsletter verification route. */
export const subscriptionVerifyContent = {
  seo: {
    title: "Confirming your subscription — The Dispatch",
    description: "Confirming the address that asked for The Dispatch.",
    keywords: ["Confirm subscription", "The Dispatch", "Newsletter"],
    ogTitle: "Confirming your subscription — The Dispatch",
    ogDescription: "Confirming the address that asked for The Dispatch.",
  } satisfies PageSeoContent,
  common: {
    brand: "ayush.dev",
    eyebrow: "The Dispatch",
    navLabel: "Blog",
    navHref: "/blog",
    footer: "The Dispatch · weekly, or thereabouts",
    privacyLabel: "What I store",
    privacyHref: "/legal/privacy#newsletter",
  },
  states: {
    working: {
      title: "Confirming…",
      intro: "One request to the server, then this page tells you where you stand. It takes a second.",
      loading: "Checking your confirmation link…",
    },
    verified: {
      title: "You're on the list.",
      intro: "That's the whole setup — no account, no password, nothing else to click. Here's exactly what you signed up for.",
      addressLabel: "Confirmed address",
      body: "The Dispatch covers web products, technology delivery, and lessons from recent projects. It arrives weekly, or thereabouts.",
      facts: [
        ["What I store", "This address and the date you confirmed it. That's the whole record — no name, no company, no open or click tracking."],
        ["What arrives", "Posts and the letter when there's something worth sending. Nothing on a schedule, and nothing from anyone else."],
        ["Leaving", "Every email has an unsubscribe link that works on the first click. No reply, no form, no reason required."],
      ],
    },
    already: {
      title: "You were already on.",
      intro: "This link had been used before. Nothing changed just now, and nothing needed to.",
      body: "Clicking the link again does not change your subscription.",
    },
    expired: {
      title: "That link has aged out.",
      intro: "Confirmation links are short-lived on purpose. Getting a new one takes one field and about ten seconds.",
      body: "Confirmation links last 24 hours. Put your address in and I'll send a fresh one.",
      emailLabel: "Email address",
      emailPlaceholder: "you@company.com",
      resendLabel: "Send a new link",
      resendBusy: "Sending",
      resendDone: "Sent",
      resendFail: "Didn't send",
      resendSuccess: "If that address is eligible, the link is on its way. Check spam if it's quiet for ten minutes.",
    },
    failed: {
      title: "That didn't go through.",
      intro: "The request broke before it reached the list, so nothing was confirmed and nothing was lost. Worth another try.",
      body: "Your link is probably fine — this was the request, not the token. Nothing has been confirmed yet, so trying again is safe.",
      retryLabel: "Try again",
      retryBusy: "Confirming",
      retryDone: "Confirmed",
      retryFail: "Still no luck",
      retryError: "Still not reaching the server. Give it a minute.",
      manualHelp: "If it keeps failing, reply to the confirmation email — that reaches a person and I'll do it by hand.",
    },
  },
  exits: [
    ["Choose what arrives", "Blog, the letter, or the rare one-off", "/subscription/preference"],
    ["Read the archive", "Every issue so far", "/letter/archive"],
  ],
} as const;

export type SubscriptionVerifyState = keyof typeof subscriptionVerifyContent.states;
