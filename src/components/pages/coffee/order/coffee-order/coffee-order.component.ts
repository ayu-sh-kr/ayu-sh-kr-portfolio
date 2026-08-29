import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { coffeeContent } from "@app/data/coffee-content.ts";

/**
 * Interactive two-step coffee order and demo confirmation.
 *
 * This shell supplies the section heading and arranges the focused order
 * elements. Selection and completion state travel through typed coffee events,
 * allowing the picker, total, feedback form, and checkout to stay independent
 * without any component reaching into another component's DOM.
 *
 * Selector: `coffee-order`.
 */
@Component({
  selector: "coffee-order",
  shadow: false,
})
export class CoffeeOrderComponent extends BaseElement {
  /** Creates the lightweight layout shell before its child components are connected. */
  constructor() {
    super();
  }
  /** Returns the section heading and the five order responsibilities in reader-facing order. */
  render(): string {
    const content = coffeeContent.order;

    return HTML`
      <section id="coffee-order" class="coffee-order-section layout-content layout-section" aria-labelledby="coffee-order-title">
        <header class="coffee-order-heading">
          <p class="coffee-eyebrow">${content.eyebrow}</p>
          <h2 id="coffee-order-title" class="type-section mt-3">${content.title}</h2>
          <p class="type-lede mt-4">${content.body}</p>
        </header>
        <div class="coffee-order-flow">
          <coffee-size-picker></coffee-size-picker>
          <coffee-quantity-picker></coffee-quantity-picker>
          <coffee-order-total></coffee-order-total>
          <coffee-order-checkout></coffee-order-checkout>
        </div>
      </section>
    `;
  }
}
