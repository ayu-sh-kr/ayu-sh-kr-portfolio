import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { CoffeeRevealLifecycle } from "@app/utils/coffee-reveal-lifecycle.utils.ts";

/**
 * Displays a lightweight recent-supporter wall and its running total.
 *
 * Entries are authored content for now, providing social proof without turning
 * the page into a feed. Future checkout integration can replace this source
 * with verified data without changing the row grammar or reveal lifecycle.
 *
 * Selector: `coffee-supporters`.
 */
@Component({
  selector: "coffee-supporters",
  shadow: false,
})
export class CoffeeSupportersComponent extends BaseElement {
  /** Observer lifecycle used for the supporter heading and individual rows. */
  private readonly revealLifecycle = new CoffeeRevealLifecycle(this);

  /** Creates the static supporter-wall element. */
  constructor() {
    super();
  }

  /** Starts revealing the supporter wall once it reaches the viewport. */
  @OnEvent("connected", true)
  initializeReveals(): void {
    this.revealLifecycle.connect();
  }

  /** Releases observer resources when the page route disconnects. */
  @OnEvent("disconnected", true)
  cleanupReveals(): void {
    this.revealLifecycle.disconnect();
  }

  /** Returns the total and the hairline-separated recent support entries. */
  render(): string {
    const content = coffeeContent.supporters;

    return HTML`
      <section class="coffee-supporters-section" aria-labelledby="coffee-supporters-title">
        <div class="coffee-container coffee-supporters-container">
          <header data-coffee-reveal>
            <p class="coffee-supporters-summary">${content.summary}</p>
            <h2 id="coffee-supporters-title" class="type-subsection mt-3">${content.title}</h2>
          </header>
          <div class="coffee-supporter-list mt-8">
            ${content.entries.map((entry) => `<article class="coffee-supporter-row" data-coffee-reveal><span class="coffee-supporter-initial" aria-hidden="true">${entry.name.slice(0, 1)}</span><div><h3>${entry.name}</h3>${entry.note ? `<p>${entry.note}</p>` : ""}</div><span class="coffee-supporter-amount">${entry.amount}</span><time>${entry.when}</time></article>`).join("")}
          </div>
        </div>
      </section>
    `;
  }
}
