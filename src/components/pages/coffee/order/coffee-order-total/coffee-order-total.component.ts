import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent, type CoffeeSize } from "@app/data/coffee-content.ts";
import { COFFEE_ORDER_QUANTITY_EVENT, COFFEE_ORDER_RESET_EVENT, COFFEE_ORDER_SIZE_EVENT } from "@app/events/coffee.events.ts";

/**
 * Calculates and renders the order's live price, breakdown, cup fill, and steam.
 *
 * It subscribes to the two picker events rather than receiving state from the
 * order shell. That keeps all price and visual calculation in one place, while
 * the controls remain responsive even as a custom quantity changes each digit.
 *
 * Selector: `coffee-order-total`.
 */
@Component({
  selector: "coffee-order-total",
  shadow: false,
})
export class CoffeeOrderTotalComponent extends BaseElement {
  /** Selected authored size ID used to derive price and order copy. */
  private selectedSizeId = "latte";

  /** Current positive coffee count supplied by the quantity picker. */
  private quantity = 1;

  /** Creates the display component before scoped event subscriptions are attached. */
  constructor() {
    super();
  }

  /**
   * Recalculates the display when the size picker publishes an authored choice.
   * @param event - Typed payload containing the selected coffee size ID.
   */
  @OnEvent(COFFEE_ORDER_SIZE_EVENT)
  updateSize(event: ApplicationEvent<typeof COFFEE_ORDER_SIZE_EVENT>): void {
    if (!coffeeContent.sizes.some((size) => size.id === event.data.sizeId)) {
      return;
    }

    this.selectedSizeId = event.data.sizeId;
    this.updateHTML();
  }

  /**
   * Recalculates the display for a validated preset or custom quantity.
   * @param event - Typed payload carrying the normalized number of coffees.
   */
  @OnEvent(COFFEE_ORDER_QUANTITY_EVENT)
  updateQuantity(event: ApplicationEvent<typeof COFFEE_ORDER_QUANTITY_EVENT>): void {
    if (!Number.isFinite(event.data.quantity) || event.data.quantity < 1) {
      return;
    }

    this.quantity = event.data.quantity;
    this.updateHTML();
  }

  /** Restores the default Latte ×1 display after the confirmation begins a new order. */
  @OnEvent(COFFEE_ORDER_RESET_EVENT)
  resetTotal(): void {
    this.selectedSizeId = "latte";
    this.quantity = 1;
    this.updateHTML();
  }

  /** Resolves the current selected ID to an authored coffee option. */
  private getSelectedSize(): CoffeeSize {
    return coffeeContent.sizes.find((size) => size.id === this.selectedSizeId) ?? coffeeContent.sizes[1];
  }

  /** Returns the current one-time price from the authored unit cost and selected quantity. */
  private getTotal(): number {
    return this.getSelectedSize().price * this.quantity;
  }

  /** Builds the accessible sentence that explains the price calculation in words. */
  private describeOrder(size: CoffeeSize): string {
    return `${this.quantity} ${size.name}${this.quantity === 1 ? "" : "s"} — ${size.description.toLowerCase()}.`;
  }

  /**
   * Maps the monetary total to a perceptible cup level while preserving the configured full-cup cap.
   *
   * A linear amount leaves a single coffee as a barely visible strip, so the
   * shallow curve gives small orders visible feedback and still reaches exactly
   * full at `coffeeContent.cupMaximum`.
   */
  private getCupFillFraction(total: number): number {
    return Math.min(1, Math.max(0.12, Math.pow(total / coffeeContent.cupMaximum, 0.65)));
  }

  /** Returns the visual cup and informational-only total panel for the current event state. */
  render(): string {
    const size = this.getSelectedSize();
    const total = this.getTotal();
    const fraction = this.getCupFillFraction(total);
    const liquidHeight = fraction * 88;

    return HTML`
      <div class="coffee-cup-wrap" style="--coffee-heat:${0.25 + fraction * 0.75}" aria-hidden="true">
        <span class="coffee-steam coffee-steam-one"></span><span class="coffee-steam coffee-steam-two"></span><span class="coffee-steam coffee-steam-three"></span>
        <svg class="coffee-cup" viewBox="0 0 160 140">
          <defs><clipPath id="coffee-cup-clip" clipPathUnits="userSpaceOnUse"><path d="M35 30h76v74a20 20 0 0 1-20 20H55a20 20 0 0 1-20-20V30Z" /></clipPath></defs>
          <g clip-path="url(#coffee-cup-clip)"><rect x="31" y="${118 - liquidHeight}" width="84" height="${liquidHeight}" style="fill:var(--primary-color)" /></g>
          <path d="M35 30h76v74a20 20 0 0 1-20 20H55a20 20 0 0 1-20-20V30Z" fill="none" style="stroke:var(--foreground-color)" stroke-width="3" />
          <path d="M111 48h10a15 15 0 0 1 0 30h-10" fill="none" style="stroke:var(--foreground-color)" stroke-width="3" stroke-linecap="round" />
          <path d="M31 30h84" style="stroke:var(--foreground-color)" stroke-width="3" stroke-linecap="round" />
        </svg>
      </div>
      <div class="coffee-total-panel">
        <p class="coffee-total-eyebrow">${coffeeContent.order.totalEyebrow}</p>
        <p class="type-price coffee-total-amount is-flashing" aria-live="polite">$${total.toFixed(2)}</p>
        <p class="coffee-total-description">${this.describeOrder(size)}</p>
        <div class="coffee-total-breakdown" aria-hidden="true"><span>Size: <b>${size.name}</b></span><span>Qty: <b>×${this.quantity}</b></span></div>
      </div>
    `;
  }
}
