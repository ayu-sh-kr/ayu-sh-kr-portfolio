import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { COFFEE_ORDER_COMPLETE_EVENT, COFFEE_ORDER_RESET_EVENT } from "@app/events/coffee.events.ts";

/**
 * Holds the optional name and thank-you note fields for a coffee order.
 *
 * The inputs remain private to the form because the demo checkout does not
 * collect or transmit them. It listens only for completion/reset events to swap
 * its white-card presentation in and out without coupling to checkout markup.
 *
 * Selector: `coffee-feedback-form`.
 */
@Component({
  selector: "coffee-feedback-form",
  shadow: false,
})
export class CoffeeFeedbackFormComponent extends BaseElement {
  /** Whether the optional feedback card belongs in the current checkout state. */
  private isVisible = true;

  /** Creates the local-only feedback element. */
  constructor() {
    super();
  }

  /** Hides the feedback card once checkout has replaced the action with confirmation. */
  @OnEvent(COFFEE_ORDER_COMPLETE_EVENT, true)
  hideAfterCheckout(): void {
    this.isVisible = false;
    this.updateHTML();
  }

  /** Restores empty optional inputs after the visitor starts another order. */
  @OnEvent(COFFEE_ORDER_RESET_EVENT, true)
  showForAnotherOrder(): void {
    this.isVisible = true;
    this.updateHTML();
  }

  /** Returns the optional feedback fields or an empty host after demo completion. */
  render(): string {
    if (!this.isVisible) {
      return "";
    }
    const content = coffeeContent.order;

    return HTML`
      <div class="coffee-details-card">
        <label><span>${content.nameLabel}</span><input name="name" type="text" autocomplete="name" placeholder="${content.namePlaceholder}" /></label>
        <label><span>${content.noteLabel}</span><textarea name="note" rows="3" placeholder="${content.notePlaceholder}"></textarea></label>
      </div>
    `;
  }
}
