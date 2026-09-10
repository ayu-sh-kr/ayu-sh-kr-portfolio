import {BaseElement, Component, HTML} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {aboutMeCardDeckContent, renderAboutMeCardDeckCards} from "@app/data/card-decks/about-me-card-deck-content.ts";
import {CardDeckLifecycleService} from "@app/service/card-deck-lifecycle.service.ts";

/**
 * Retains the subtle authored offsets that make the About Me cards read as a physical stack.
 *
 * Values are applied in visible-card order by the shared lifecycle service after the route
 * connects, leaving this component responsible only for its visual integration contract.
 */
const CARD_TILTS = ["-0.5deg", "0.6deg", "-0.45deg", "0.55deg"];

/**
 * Presents the focused About Me route as a short, interactive personal narrative.
 *
 * Route-specific content is authored in the deck content module. The component supplies that
 * markup and its visual CSS-variable mapping, while the shared lifecycle service handles the
 * card state, navigation controls, assistive announcements, cleanup, and analytics.
 *
 * Selector: `about-me-card-deck`.
 */
@Component({selector: "about-me-card-deck", shadow: false})
export class AboutMeCardDeckComponent extends BaseElement {
  /**
   * Shares card state with the other decks while retaining About Me's DOM and CSS variables.
   *
   * Only selectors and transform property names vary between decks. Pointer behavior, analytics,
   * accessibility, and teardown therefore remain governed by one tested lifecycle implementation.
   */
  private readonly deckLifecycle = new CardDeckLifecycleService({
    deck: "about_me",
    cardSelector: "[data-about-me-deck-card]",
    deckSelector: "[data-about-me-deck]",
    previousSelector: "[data-about-me-deck-previous]",
    nextSelector: "[data-about-me-deck-next]",
    tickListSelector: "[data-about-me-deck-ticks]",
    liveRegionSelector: "[data-about-me-deck-live]",
    hintSelector: "[data-about-me-deck-hint]",
    tickClassName: "about-me-deck__tick",
    cardTilts: CARD_TILTS,
    variables: {
      tilt: "--about-me-deck-tilt",
      depth: "--about-me-deck-depth",
      x: "--about-me-deck-x",
      y: "--about-me-deck-y",
      rotation: "--about-me-deck-rotation",
      duration: "--about-me-deck-duration",
      progress: "--about-me-deck-progress",
      dragDistance: "--about-me-deck-dx",
    },
  });

  /**
   * Connects the shared controller once Dota has rendered this route's light DOM.
   *
   * Calling this from the scoped lifecycle event makes the DOM query and event wiring safe for
   * both hydrated output and normal client-side route transitions.
   */
  @OnEvent("connected", true)
  connectDeck(): void {
    this.deckLifecycle.connect(this);
  }

  /**
   * Releases the controller's dynamic listeners and transition timers on route exit.
   *
   * This symmetrical teardown ensures an interrupted transition cannot later mutate the old
   * About Me route after the visitor has navigated elsewhere.
   */
  @OnEvent("disconnected", true)
  disconnectDeck(): void {
    this.deckLifecycle.disconnect();
  }

  /**
   * Renders the About Me shell around content-owned cards without changing deck state.
   *
   * The content module owns reader-facing text and destinations, preserving a clean boundary
   * between route copy and the reusable interaction system.
   */
  render(): string {
    const content = aboutMeCardDeckContent;
    return HTML`<section class="about-me-deck about-me-deck--about layout-section" aria-label="${content.sectionLabel}"><div class="about-me-deck__stage layout-content"><div class="about-me-deck__stack" data-about-me-deck role="group" aria-roledescription="card deck" aria-label="${content.deckAriaLabel}" tabindex="0">${renderAboutMeCardDeckCards()}</div><p class="about-me-deck__live" data-about-me-deck-live aria-live="polite" aria-atomic="true"></p></div><footer class="about-me-deck__controls layout-content"><div><button type="button" data-about-me-deck-previous aria-label="${content.previousCardAriaLabel}">←</button><nav data-about-me-deck-ticks aria-label="${content.cardsAriaLabel}"></nav><button type="button" data-about-me-deck-next aria-label="${content.nextCardAriaLabel}">→</button></div><p data-about-me-deck-hint>${content.hint}</p></footer></section>`;
  }
}
