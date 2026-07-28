import { ApplicationEventService, BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { COFFEE_ORDER_QUANTITY_EVENT, COFFEE_ORDER_RESET_EVENT, type CoffeeOrderQuantitySelection } from "@app/events/coffee.events.ts";

/**
 * Chooses a preset or custom number of coffees without losing input focus.
 *
 * It publishes normalized quantities to the total and checkout components. The
 * custom input deliberately updates only its local number while typing; this
 * prevents an order-wide render from replacing the focused input on each digit.
 *
 * Selector: `coffee-quantity-picker`.
 */
@Component({
  selector: "coffee-quantity-picker",
  shadow: false,
})
export class CoffeeQuantityPickerComponent extends BaseElement {
  /** Application-wide publisher used to distribute valid quantity changes. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Current quantity used for the next event and the control's selected state. */
  private quantity = 1;

  /** Whether the inline custom input rather than a preset button owns `quantity`. */
  private isCustomQuantity = false;

  /** Creates the picker before its buttons and input are rendered. */
  constructor() {
    super();
  }

  /**
   * Selects a preset or exposes the custom input, then informs dependent order components.
   * @param event - Click from a quantity button or its text content.
   */
  @BindEvent({ event: "click", id: "[data-coffee-quantity]" })
  selectQuantity(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-coffee-quantity]");
    const value = button?.dataset.coffeeQuantity;
    if (!value) {
      return;
    }

    this.isCustomQuantity = value === "custom";
    if (!this.isCustomQuantity) {
      this.quantity = Number(value);
    }
    this.updateHTML();
    if (this.isCustomQuantity) {
      window.requestAnimationFrame(() => this.querySelector<HTMLInputElement>("#coffee-custom-quantity")?.focus());
    }
    this.publishQuantity();
  }

  /**
   * Normalizes custom input and publishes it without re-rendering the focused field.
   * @param event - Input event carrying the visitor's current numeric value.
   */
  @BindEvent({ event: "input", id: "#coffee-custom-quantity" })
  updateCustomQuantity(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.quantity = Math.min(999, Math.max(1, Number.parseInt(input.value, 10) || 1));
    this.publishQuantity();
  }

  /** Restores the default single-coffee selection when the confirmation starts another order. */
  @OnEvent(COFFEE_ORDER_RESET_EVENT, true)
  resetQuantity(): void {
    this.quantity = 1;
    this.isCustomQuantity = false;
    this.updateHTML();
  }

  /** Publishes the current quantity after either a preset or custom selection change. */
  private publishQuantity(): void {
    void this.publisher.publishAsync({
      name: COFFEE_ORDER_QUANTITY_EVENT,
      data: { quantity: this.quantity, isCustom: this.isCustomQuantity } satisfies CoffeeOrderQuantitySelection,
    });
  }

  /** Returns the preset controls and an optional, keyboard-focused custom input. */
  render(): string {
    const content = coffeeContent.order;

    return HTML`
      <fieldset class="coffee-order-question">
        <legend><span>2</span>${content.quantityQuestion}</legend>
        <div class="coffee-quantity-grid">
          ${coffeeContent.quantities.map((quantity) => `<button class="coffee-quantity ${!this.isCustomQuantity && quantity === this.quantity ? "is-selected" : ""}" type="button" data-coffee-quantity="${quantity}" aria-pressed="${!this.isCustomQuantity && quantity === this.quantity}">×${quantity}</button>`).join("")}
          <button class="coffee-quantity ${this.isCustomQuantity ? "is-selected" : ""}" type="button" data-coffee-quantity="custom" aria-pressed="${this.isCustomQuantity}">${content.customLabel}</button>
        </div>
        <label class="coffee-custom-quantity ${this.isCustomQuantity ? "is-visible" : ""}" for="coffee-custom-quantity">
          <input id="coffee-custom-quantity" type="number" min="1" max="999" value="${this.quantity}" aria-label="Custom coffee quantity" />
          <span>${content.customHint}</span>
        </label>
      </fieldset>
    `;
  }
}
