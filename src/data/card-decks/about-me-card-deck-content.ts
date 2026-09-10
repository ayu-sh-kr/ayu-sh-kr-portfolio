/**
 * Copy and accessible labels for the focused About Me card route.
 *
 * `AboutMeCardDeckComponent` reads this authored data while the shared lifecycle service owns
 * card state. The array is ordered back-to-front to match the deck's static stacking markup.
 */
export type AboutMeCardDeckContent = {
  /** Landmark label announced for the route's personal narrative. */
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
};

/** Supplies labels owned by the About Me card route and its deck controls. */
export const aboutMeCardDeckContent: AboutMeCardDeckContent = {
  sectionLabel: "About Ayush",
  deckAriaLabel: "Four cards. Use the arrow keys or pull the top card away.",
  cardsAriaLabel: "Cards",
  previousCardAriaLabel: "Previous card",
  nextCardAriaLabel: "Next card",
  hint: "Pull the top card away",
};

/**
 * Renders the personal-story cards within the shared deck shell.
 *
 * Content lives here rather than beside lifecycle code so wording, destinations, and analytics
 * data attributes can change without touching pointer handling or navigation state.
 *
 * @returns Trusted markup for the four About Me cards, ordered back-to-front for stacking.
 */
export const renderAboutMeCardDeckCards = (): string => `
  <article class="about-me-deck__card about-me-deck__card--about-close" data-about-me-deck-card aria-label="Card 4 of 4">
    <p class="about-me-deck__index">04</p><h2>And I'll tell you what I'd do <span>differently</span>.</h2><p>Early, while it's still cheap to change your mind. It's the most useful thing I can hand anyone, and it costs nothing.</p>
    <div class="about-me-deck__doors"><a data-card-deck-link="profile" data-card-deck-destination="/showcase" href="/showcase">See what I've built →</a><a data-card-deck-link="content" data-card-deck-destination="/blog" href="/blog">Read what I write →</a><a data-card-deck-link="cta" data-card-deck-destination="/cards/reach-out" href="/cards/reach-out">Start something →</a></div>
  </article>
  <article class="about-me-deck__card about-me-deck__card--about-branch" data-about-me-deck-card aria-label="Card 3 of 4"><p class="about-me-deck__index">03</p><h2>Then I'll follow it <span>anywhere</span>.</h2><div class="about-me-deck__branch"><p>Some weeks that's a queue that won't drain.</p><p>Some weeks it's why a headline breaks at 200% zoom.</p><small>Same itch, different end of the machine.</small></div></article>
  <article class="about-me-deck__card about-me-deck__card--about-build" data-about-me-deck-card aria-label="Card 2 of 4"><p class="about-me-deck__index">02</p><h2>Which usually ends with me wondering how I'd have <span>built</span> it.</h2><p>That's how I ended up writing my own component libraries rather than reaching for someone else's.</p><p class="about-me-deck__mono">dota-core · dota-wrap · dota-rest</p></article>
  <article class="about-me-deck__card about-me-deck__card--about-intro" data-about-me-deck-card aria-label="Card 1 of 4"><p class="about-me-deck__index">01</p><div><h1>I'm Ayush. I like knowing how things <span>work</span>.</h1><p>Backend engineer, four years in. The curiosity turned up first.</p></div></article>`;
