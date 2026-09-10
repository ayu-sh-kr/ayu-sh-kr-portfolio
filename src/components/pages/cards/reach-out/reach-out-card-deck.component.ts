import {BaseElement, Component, HTML} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {renderReachOutCardDeckCards} from "@app/data/card-decks/reach-out-card-deck-content.ts";
import {reachOutContent} from "@app/data/reach-out-content.ts";
import {CardDeckLifecycleService} from "@app/service/card-deck-lifecycle.service.ts";

/**
 * Retains the subtle authored offsets that distinguish the Reach Out deck's resting cards.
 *
 * The shared lifecycle service applies them in visible order during connection, leaving the
 * content module and this adapter free of duplicated pointer or transition code.
 */
const CARD_TILTS = ["-0.5deg", "0.6deg", "-0.45deg", "0.55deg"];

/**
 * Presents a focused, client-facing conversation route as four pullable cards.
 *
 * The route's SEO and shared wording remain in `reach-out-content`; deck-only markup lives in
 * its content module. After connection, the shared lifecycle service owns gesture state,
 * keyboard and button navigation, accessible progress, analytics, and safe route teardown.
 *
 * Selector: `reach-out-card-deck`.
 */
@Component({selector: "reach-out-card-deck", shadow: false})
export class ReachOutCardDeckComponent extends BaseElement {
  /**
   * Shares card state with the other decks while retaining Reach Out's DOM and CSS variables.
   *
   * This deck does not use raw drag-distance or progress properties, so its mapping only lists
   * the transforms its stylesheet consumes; the shared service treats those extras as optional.
   */
  private readonly deckLifecycle = new CardDeckLifecycleService({
    deck: "reach_out",
    cardSelector: "[data-reach-out-card]",
    deckSelector: "[data-reach-out-deck]",
    previousSelector: "[data-reach-out-previous]",
    nextSelector: "[data-reach-out-next]",
    tickListSelector: "[data-reach-out-ticks]",
    liveRegionSelector: "[data-reach-out-live]",
    hintSelector: "[data-reach-out-hint]",
    tickClassName: "reach-out__tick",
    cardTilts: CARD_TILTS,
    variables: {
      tilt: "--reach-out-tilt",
      depth: "--reach-out-depth",
      x: "--reach-out-x",
      y: "--reach-out-y",
      rotation: "--reach-out-drag-rotation",
      duration: "--reach-out-duration",
    },
  });

  /**
   * Connects the controller after the server-rendered deck is available in the light DOM.
   *
   * The scoped Dota lifecycle guarantees cards, controls, and the live region exist before the
   * service installs its dynamic listeners and machine subscription.
   */
  @OnEvent("connected", true)
  connectDeck(): void {
    this.deckLifecycle.connect(this);
  }

  /**
   * Aborts route-bound listeners and delayed transitions before the component disconnects.
   *
   * The service owns every installed listener through one abort controller, making repeated
   * client-side visits safe and preventing analytics from being emitted by an old deck instance.
   */
  @OnEvent("disconnected", true)
  disconnectDeck(): void {
    this.deckLifecycle.disconnect();
  }

  /**
   * Renders the content-owned Reach Out cards within the shared interactive shell.
   *
   * The service does not participate in rendering, so this stays a pure server-safe projection
   * of the content module and the existing route-level copy record.
   */
  render(): string {
    const {page} = reachOutContent;
    return HTML`<section class="reach-out-card-deck" aria-label="${page.label}"><div class="reach-out-card-deck__stage layout-content"><div class="reach-out__deck" data-reach-out-deck role="group" aria-roledescription="card deck" aria-label="${page.deckAriaLabel}" tabindex="0">${renderReachOutCardDeckCards()}</div><p class="reach-out__live" data-reach-out-live aria-live="polite" aria-atomic="true"></p></div><footer class="reach-out-card-deck__controls layout-content"><div class="reach-out__helm"><div class="reach-out__navigation"><button class="reach-out__step" data-reach-out-previous type="button" aria-label="${page.previousCardAriaLabel}">←</button><nav class="reach-out__ticks" data-reach-out-ticks aria-label="${page.cardsAriaLabel}"></nav><button class="reach-out__step" data-reach-out-next type="button" aria-label="${page.nextCardAriaLabel}">→</button></div><p class="reach-out__hint" data-reach-out-hint>${page.hint}</p></div></footer></section>`;
  }
}
