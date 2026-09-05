import { MAILTO } from "@app/data/email-config.ts";
import type { PageSeoContent } from "@app/data/seo-content.ts";

/**
 * Authored copy for the shareable `/cards/reach-out` conversation.
 *
 * The route consumes its metadata while the deck consumes each narrative step,
 * allowing client-facing wording to change without touching interaction code.
 */
export const reachOutContent = {
  seo: {
    title: "Reach out — Ayush Kumar Jaiswal",
    description: "A short introduction to starting a website, web product, dashboard, event-flow, Meta integration, AI, or platform engagement with Ayush Kumar Jaiswal.",
    keywords: ["Ayush Kumar Jaiswal", "website developer", "web application developer", "Meta app integration", "technology consultant", "project inquiry"],
    ogTitle: "Got something in mind?",
    ogDescription: "Bring a thing you want built, or a problem you have not named yet.",
  } satisfies PageSeoContent,

  page: {
    label: "Reach out",
    deckAriaLabel: "Four cards. Use the arrow keys or pull the top card away.",
    hint: "Pull a card, or use the arrows",
    previousCardAriaLabel: "Previous card",
    nextCardAriaLabel: "Next card",
    cardsAriaLabel: "Cards",
  },

  cards: [
    {
      number: "01",
      titleBeforeAccent: "Got ",
      titleAccent: "something",
      titleAfterAccent: " in mind?",
      body: "It doesn’t have to be figured out yet.",
    },
    {
      number: "02",
      titleBeforeAccent: "First we work out what it ",
      titleAccent: "actually",
      titleAfterAccent: " is.",
      rangeStart: "a hunch",
      rangeEnd: "a full spec",
      body: "Anywhere on that line is a fine place to start.",
    },
    {
      number: "03",
      titleBeforeAccent: "Then I go and ",
      titleAccent: "build",
      titleAfterAccent: " it.",
      body: "Properly, and slowly enough that it still makes sense in a year — when neither of us remembers why we did it that way.",
    },
    {
      number: "04",
      titleBeforeAccent: "So — what’s the ",
      titleAccent: "thing?",
      titleAfterAccent: "",
      body: "Email is the shortest path. Two lines is plenty.",
      emailLabel: "Drop me an email",
      emailHref: MAILTO.helloSubject("Something I have in mind"),
      homeLabel: "Or have a look around first",
    },
  ] as const,
} as const;
