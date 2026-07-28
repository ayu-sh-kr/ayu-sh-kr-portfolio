import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { CoffeeRevealLifecycle } from "@app/utils/coffee-reveal-lifecycle.utils.ts";

/**
 * Ends the coffee route with one calm, tinted return-to-order invitation.
 *
 * This is intentionally a small leaf component: its only job is to provide a
 * reassuring final CTA after the supporter wall, while the order component
 * remains the sole owner of selection and confirmation state.
 *
 * Selector: `coffee-closing`.
 */
@Component({
  selector: "coffee-closing",
  shadow: false,
})
export class CoffeeClosingComponent extends BaseElement {
  /** Observer lifecycle used to reveal the single closing card. */
  private readonly revealLifecycle = new CoffeeRevealLifecycle(this);

  /** Creates the closing CTA element. */
  constructor() {
    super();
  }

  /** Starts the one-shot reveal after the closing card is rendered. */
  @OnEvent("connected", true)
  initializeReveal(): void {
    this.revealLifecycle.connect();
  }

  /** Releases the observer and preference listener with the route. */
  @OnEvent("disconnected", true)
  cleanupReveal(): void {
    this.revealLifecycle.disconnect();
  }

  /** Returns the final link back to the one-time order controls. */
  render(): string {
    const content = coffeeContent.closing;

    return HTML`
      <section class="coffee-closing-section" aria-label="Support invitation">
        <div class="coffee-container coffee-closing-container">
          <div class="coffee-invite" data-coffee-reveal>
            <h2 class="type-subsection">${content.title}</h2>
            <p class="type-lede mt-4">${content.body}</p>
            <a class="coffee-accent-button mt-7" href="#coffee-order">${content.cta}</a>
          </div>
        </div>
      </section>
    `;
  }
}
