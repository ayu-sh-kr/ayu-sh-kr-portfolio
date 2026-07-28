import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { CoffeeRevealLifecycle } from "@app/utils/coffee-reveal-lifecycle.utils.ts";

/**
 * Explains the three independent outcomes of one-time coffee support.
 *
 * The content is deliberately unnumbered: these are simultaneous places the
 * support goes, not steps in a process. The shared lifecycle adds a quiet
 * one-shot reveal once this section reaches the viewport.
 *
 * Selector: `coffee-impact`.
 */
@Component({
  selector: "coffee-impact",
  shadow: false,
})
export class CoffeeImpactComponent extends BaseElement {
  /** Observer lifecycle used for this section's heading and column reveals. */
  private readonly revealLifecycle = new CoffeeRevealLifecycle(this);

  /** Creates the static content element. */
  constructor() {
    super();
  }

  /** Starts observing the rendered impact content after connection. */
  @OnEvent("connected", true)
  initializeReveals(): void {
    this.revealLifecycle.connect();
  }

  /** Disconnects the shared observer when navigating away from the route. */
  @OnEvent("disconnected", true)
  cleanupReveals(): void {
    this.revealLifecycle.disconnect();
  }

  /** Returns the unnumbered outcomes funded by a coffee order. */
  render(): string {
    const content = coffeeContent.impact;

    return HTML`
      <section id="coffee-impact" class="coffee-impact-section" aria-labelledby="coffee-impact-title">
        <div class="coffee-container coffee-impact-container">
          <header data-coffee-reveal>
            <p class="coffee-eyebrow">${content.eyebrow}</p>
            <h2 id="coffee-impact-title" class="type-section mt-3">${content.title}</h2>
          </header>
          <div class="coffee-impact-grid mt-10">
            ${content.items.map((item) => `<article class="coffee-impact-item" data-coffee-reveal><span class="coffee-impact-icon" aria-hidden="true">${item.icon}</span><h3>${item.title}</h3><p>${item.body}</p></article>`).join("")}
          </div>
        </div>
      </section>
    `;
  }
}
