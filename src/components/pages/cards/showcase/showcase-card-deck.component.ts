import {BaseElement, Component, HTML} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {renderShowcaseCardDeckCards, showcaseCardDeckContent} from "@app/data/card-decks/showcase-card-deck-content.ts";
import {CardDeckLifecycleService} from "@app/service/card-deck-lifecycle.service.ts";

/**
 * Gives the stacked showcase cards the small authored offsets used by their existing CSS.
 *
 * The lifecycle service applies these values in visible-card order during connection. Keeping
 * them beside the component makes the visual treatment explicit without reintroducing logic.
 */
const CARD_TILTS = ["-0.5deg", "0.6deg", "-0.45deg", "0.55deg", "-0.55deg"];

/**
 * Presents the showcase introduction as five pullable cards on the focused card route.
 *
 * Authored copy and visual markup come from the showcase deck content module. Once its light
 * DOM connects, this component delegates every interaction, accessibility update, and analytics
 * fact to the shared lifecycle service; rendering remains a pure projection of that content.
 *
 * Selector: `showcase-card-deck`.
 */
@Component({selector: "showcase-card-deck", shadow: false})
export class ShowcaseCardDeckComponent extends BaseElement {
  /**
   * Shares card state with the other decks while retaining Showcase's DOM vocabulary.
   *
   * The CSS-variable map is the only presentation-specific behavior the lifecycle needs. This
   * keeps card interactions consistent without coupling the Showcase stylesheet to other decks.
   */
  private readonly deckLifecycle = new CardDeckLifecycleService({
    deck: "showcase",
    cardSelector: "[data-showcase-deck-card]",
    deckSelector: "[data-showcase-deck]",
    previousSelector: "[data-showcase-deck-previous]",
    nextSelector: "[data-showcase-deck-next]",
    tickListSelector: "[data-showcase-deck-ticks]",
    liveRegionSelector: "[data-showcase-deck-live]",
    hintSelector: "[data-showcase-deck-hint]",
    tickClassName: "showcase-deck__tick",
    cardTilts: CARD_TILTS,
    variables: {
      tilt: "--showcase-deck-tilt",
      depth: "--showcase-deck-depth",
      x: "--showcase-deck-x",
      y: "--showcase-deck-y",
      rotation: "--showcase-deck-rotation",
      duration: "--showcase-deck-duration",
      progress: "--showcase-deck-progress",
      dragDistance: "--showcase-deck-dx",
    },
  });

  /**
   * Connects the rendered deck after Dota has made its cards and controls available.
   *
   * The scoped lifecycle event ensures the service never queries markup before this component's
   * initial render completes.
   */
  @OnEvent("connected", true)
  connectDeck(): void {
    this.deckLifecycle.connect(this);
  }

  /**
   * Stops pending transitions and event listeners when the focused card route disconnects.
   *
   * The service aborts its dynamic listeners and timers, preventing detached Showcase cards from
   * receiving a late pointer event or transition callback.
   */
  @OnEvent("disconnected", true)
  disconnectDeck(): void {
    this.deckLifecycle.disconnect();
  }

  /**
   * Renders the deck shell around content-owned showcase cards without side effects.
   *
   * The lifecycle service adopts this light DOM only after connection, so rendering remains safe
   * for server output and future content-only updates.
   */
  render(): string {
    const content = showcaseCardDeckContent;
    return HTML`<section class="showcase-deck layout-section" aria-label="${content.sectionLabel}"><div class="showcase-deck__stage layout-content"><div class="showcase-deck__stack" data-showcase-deck role="group" aria-roledescription="card deck" aria-label="${content.deckAriaLabel}" tabindex="0">${renderShowcaseCardDeckCards()}</div><p class="showcase-deck__live" data-showcase-deck-live aria-live="polite" aria-atomic="true"></p></div><footer class="showcase-deck__controls layout-content"><div><button type="button" data-showcase-deck-previous aria-label="${content.previousCardAriaLabel}">←</button><nav data-showcase-deck-ticks aria-label="${content.cardsAriaLabel}"></nav><button type="button" data-showcase-deck-next aria-label="${content.nextCardAriaLabel}">→</button></div><p data-showcase-deck-hint>${content.hint}</p></footer></section>`;
  }
}
