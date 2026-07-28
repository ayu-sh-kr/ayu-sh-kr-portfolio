import { ApplicationEventService, BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent, type CoffeeSize } from "@app/data/coffee-content.ts";
import { COFFEE_ORDER_COMPLETE_EVENT, COFFEE_ORDER_QUANTITY_EVENT, COFFEE_ORDER_RESET_EVENT, COFFEE_ORDER_SIZE_EVENT } from "@app/events/coffee.events.ts";

/**
 * Owns the demo checkout action and the resulting thank-you state.
 *
 * It listens to the same picker events as the total so confirmation always
 * names the actual selection. No payment data or feedback text crosses the
 * event bus; production checkout can later replace the completion action here.
 *
 * Selector: `coffee-order-checkout`.
 */
@Component({
  selector: "coffee-order-checkout",
  shadow: false,
})
export class CoffeeOrderCheckoutComponent extends BaseElement {
  /** Publisher used to coordinate the feedback form after checkout or reset. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Current authored size ID used to write the confirmation copy. */
  private selectedSizeId = "latte";

  /** Current quantity used to write the confirmation copy and price. */
  private quantity = 1;

  /** Whether the checkout action has been replaced by its thank-you confirmation. */
  private isComplete = false;

  /** Creates the checkout element before it begins receiving scoped order events. */
  constructor() {
    super();
  }

  /**
   * Stores a validated selected size so the confirmation matches the total panel.
   * @param event - Typed payload from the size picker with an authored size ID.
   */
  @OnEvent(COFFEE_ORDER_SIZE_EVENT, true)
  updateSize(event: ApplicationEvent<typeof COFFEE_ORDER_SIZE_EVENT>): void {
    if (!coffeeContent.sizes.some((size) => size.id === event.data.sizeId)) {
      return;
    }
    this.selectedSizeId = event.data.sizeId;
  }

  /**
   * Stores a validated quantity so confirmation matches the total panel.
   * @param event - Typed payload from the quantity picker carrying its normalized value.
   */
  @OnEvent(COFFEE_ORDER_QUANTITY_EVENT, true)
  updateQuantity(event: ApplicationEvent<typeof COFFEE_ORDER_QUANTITY_EVENT>): void {
    if (!Number.isFinite(event.data.quantity) || event.data.quantity < 1) {
      return;
    }
    this.quantity = event.data.quantity;
  }

  /**
   * Replaces the demo checkout action with confirmation and hides the optional form.
   * @param event - Click on the one-time checkout button; no external payment is made yet.
   */
  @BindEvent({ event: "click", id: "#coffee-checkout-button" })
  completeDemoCheckout(event: MouseEvent): void {
    event.preventDefault();
    this.isComplete = true;
    this.updateHTML();
    void this.publisher.publishAsync({ name: COFFEE_ORDER_COMPLETE_EVENT, data: null });
  }

  /** Restores the initial action state and tells all order elements to reset their local selection. */
  @BindEvent({ event: "click", id: "#coffee-order-reset" })
  startAnotherOrder(): void {
    this.selectedSizeId = "latte";
    this.quantity = 1;
    this.isComplete = false;
    this.updateHTML();
    void this.publisher.publishAsync({ name: COFFEE_ORDER_RESET_EVENT, data: null });
  }

  /** Resolves the current size ID to the authored option used in checkout copy. */
  private getSelectedSize(): CoffeeSize {
    return coffeeContent.sizes.find((size) => size.id === this.selectedSizeId) ?? coffeeContent.sizes[1];
  }

  /** Calculates the price echoed in the demo confirmation from the selected order. */
  private getTotal(): number {
    return this.getSelectedSize().price * this.quantity;
  }

  /** Returns the checkout CTA or its confirmation state for the current selection. */
  render(): string {
    const content = coffeeContent.order;
    if (!this.isComplete) {
      return HTML`
        <div class="coffee-order-cta">
          <button id="coffee-checkout-button" class="coffee-accent-button" type="button">${content.submitLabel}</button>
          <p>${content.checkoutNotice}</p>
        </div>
      `;
    }

    const size = this.getSelectedSize();
    const total = this.getTotal();
    return HTML`
      <div class="coffee-thanks-card">
        <span class="coffee-thanks-badge" aria-hidden="true">✓</span>
        <h3>${content.thanksTitle}</h3>
        <p>Ayush just got your ${this.quantity} ${size.name.toLowerCase()}${this.quantity === 1 ? "" : "s"} ($${total.toFixed(2)}). He reads every note.</p>
        <button id="coffee-order-reset" class="coffee-ghost-button" type="button">${content.anotherLabel}</button>
      </div>
    `;
  }
}
