import {getShowcaseProject} from "@app/data/showcase-content.ts";

/**
 * Copy and accessible labels for the interactive showcase card deck.
 *
 * The showcase-deck component consumes this module during its pure render step. Keeping the
 * reader-facing wording here lets content edits avoid the lifecycle and analytics mechanics
 * shared by every card deck.
 */
export type ShowcaseCardDeckContent = {
  /** Landmark label announced for the selected-work deck. */
  sectionLabel: string;
  /** Keyboard instruction exposed on the focusable stack. */
  deckAriaLabel: string;
  /** Label for the deck's card-picker navigation. */
  cardsAriaLabel: string;
  /** Accessible name for the restored backward navigation control. */
  previousCardAriaLabel: string;
  /** Accessible name for the forward navigation control. */
  nextCardAriaLabel: string;
  /** Gesture instruction retired after the visitor first navigates. */
  hint: string;
  /** Opening card copy that frames the project sequence. */
  introduction: { index: string; title: string; body: string };
  /** Conversation CTA shown after the project cards. */
  conversation: { index: string; title: string; body: string; label: string; href: string };
};

/**
 * Supplies the authored language for the selected-work deck.
 *
 * Project names and kinds still come from the showcase catalog, preserving one source of truth
 * for work that also appears on the main showcase index and case-study routes.
 */
export const showcaseCardDeckContent: ShowcaseCardDeckContent = {
  sectionLabel: "Selected work",
  deckAriaLabel: "Five cards. Use the arrow keys or pull the top card away.",
  cardsAriaLabel: "Cards",
  previousCardAriaLabel: "Previous card",
  nextCardAriaLabel: "Next card",
  hint: "Pull the top card away",
  introduction: {
    index: "01",
    title: "So — what do I <span>actually</span> build?",
    body: "Depends what needs solving. Here are three with almost nothing in common.",
  },
  conversation: {
    index: "05",
    title: "Yours won't look like any of these.",
    body: "Tell me what you're stuck on — even if you're not sure yet that it's a software problem.",
    label: "Tell me about it",
    href: "/cards/reach-out",
  },
};

/**
 * Renders the showcase-specific cards within the shared deck shell.
 *
 * The component calls this from `render()` after it has selected the shared lifecycle service.
 * The returned markup remains intentionally deck-specific because the project cards carry their
 * own visual compositions; only interaction and state management are shared.
 *
 * @returns Trusted markup for the five showcase cards, ordered back-to-front for stacking.
 */
export const renderShowcaseCardDeckCards = (): string => {
  const sacrena = getShowcaseProject("sacrena")!;
  const restaurant = getShowcaseProject("restaurant-oms")!;
  const dota = getShowcaseProject("dota-workspace")!;
  const {conversation, introduction} = showcaseCardDeckContent;
  return `
    <article class="showcase-deck__card showcase-deck__card--five" data-showcase-deck-card aria-label="Card 5 of 5">
      <p class="showcase-deck__index">${conversation.index}</p>
      <div class="showcase-deck__cta"><h2>${conversation.title}</h2><p>${conversation.body}</p><a class="app-link app-link--button app-link--accent" data-card-deck-link="cta" data-card-deck-destination="${conversation.href}" href="${conversation.href}">${conversation.label} <span aria-hidden="true">→</span></a></div>
    </article>
    <article class="showcase-deck__card showcase-deck__card--work showcase-deck__card--dota" data-showcase-deck-card aria-label="Card 4 of 5"><div class="showcase-deck__brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="showcase-deck__head"><p class="showcase-deck__index">04</p><p>Open source</p></div><p class="showcase-deck__plate">dota-workspace</p><h2>You're <span>holding</span> it.</h2><p>Small libraries for building interfaces from the browser's own parts. This card is made with them.</p><a data-card-deck-link="project" data-card-deck-destination="/showcase/${dota.slug}" href="/showcase/${dota.slug}">See the project →</a></article>
    <article class="showcase-deck__card showcase-deck__card--work showcase-deck__card--restaurant" data-showcase-deck-card aria-label="Card 3 of 5"><div class="showcase-deck__head"><p class="showcase-deck__index">03</p><p>${restaurant.kind}</p></div><p class="showcase-deck__plate">${restaurant.title}</p><h2>Table to kitchen, without the shouting.</h2><div class="showcase-deck__ticket" aria-hidden="true"><span>#0412 · T6</span><b>2× thali, 1× lassi, no chilli</b><i><em></em></i><small>Placed</small></div><p>The software wasn't the hard part. Making it usable by someone holding three plates was.</p><a data-card-deck-link="project" data-card-deck-destination="/showcase/${restaurant.slug}" href="/showcase/${restaurant.slug}">See the project →</a></article>
    <article class="showcase-deck__card showcase-deck__card--work showcase-deck__card--sacrena" data-showcase-deck-card aria-label="Card 2 of 5"><div class="showcase-deck__head"><p class="showcase-deck__index">02</p><p>Backend · 2 years</p></div><p class="showcase-deck__plate">${sacrena.title}</p><h2>The part of a dating app nobody ever sees.</h2><p>I'm the whole backend — APIs, data, infrastructure, and the 3am pages. Done right, the app just feels quick.</p><div class="showcase-deck__trace" aria-hidden="true"></div><a data-card-deck-link="project" data-card-deck-destination="/showcase/${sacrena.slug}" href="/showcase/${sacrena.slug}">See the project →</a></article>
    <article class="showcase-deck__card showcase-deck__card--one" data-showcase-deck-card aria-label="Card 1 of 5"><p class="showcase-deck__index">${introduction.index}</p><h2>${introduction.title}</h2><p>${introduction.body}</p></article>`;
};
