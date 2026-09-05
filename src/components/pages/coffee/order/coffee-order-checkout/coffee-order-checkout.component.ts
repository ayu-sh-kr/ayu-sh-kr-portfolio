import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent, type CoffeeSize } from "@app/data/coffee-content.ts";
import { type ActionButtonPayload } from "@app/events/action-button.events.ts";
import { COFFEE_ORDER_QUANTITY_EVENT, COFFEE_ORDER_SIZE_EVENT } from "@app/events/coffee.events.ts";
import { actionButtonRegistry } from "@app/service/action-button-registry.service.ts";
import { coffeeOrderService } from "@app/service/coffee-order/coffee-order.service.ts";

/**
 * Owns the coffee order form and its real payment checkout.
 *
 * The optional name and note fields live in a native `<form>` so the shared
 * `action-button` captures them through `FormData`; this component never reads
 * another element's inputs. It tracks the selected size and quantity from the
 * picker events, registers the `coffee.order` handler, and on success redirects
 * the browser to Razorpay's hosted payment link. Pending, success, and failure
 * presentation are delegated to the shared action button.
 *
 * Selector: `coffee-order-checkout`.
 */
@Component({
  selector: "coffee-order-checkout",
  shadow: false,
})
export class CoffeeOrderCheckoutComponent extends BaseElement {
  /** Transport boundary shared with the buy-coffee backend. */
  private readonly orderService = coffeeOrderService;

  /** Current authored size ID used to compute the charged amount. */
  private selectedSizeId = "latte";

  /** Current quantity used to compute the charged amount. */
  private quantity = 1;

  /** Registry cleanup returned for this form's submit action. */
  private removeHandler: (() => void) | null = null;

  /** Creates the checkout element before it begins receiving scoped order events. */
  constructor() {
    super();
  }

  /** Registers the payment handler so the shared action button can start checkout. */
  @OnEvent("connected", true)
  onConnected(): void {
    this.removeHandler = actionButtonRegistry.registerHandler("coffee.order", (payload) => this.submitOrder(payload));
  }

  /** Releases the handler registration when this route instance leaves. */
  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.removeHandler?.();
    this.removeHandler = null;
  }

  /**
   * Stores a validated selected size and refreshes the button's total label.
   * @param event - Typed payload from the size picker with an authored size ID.
   */
  @OnEvent(COFFEE_ORDER_SIZE_EVENT)
  updateSize(event: ApplicationEvent<typeof COFFEE_ORDER_SIZE_EVENT>): void {
    if (!coffeeContent.sizes.some((size) => size.id === event.data.sizeId)) {
      return;
    }
    this.selectedSizeId = event.data.sizeId;
    this.refreshButtonLabel();
  }

  /**
   * Stores a validated quantity and refreshes the button's total label.
   * @param event - Typed payload from the quantity picker carrying its normalized value.
   */
  @OnEvent(COFFEE_ORDER_QUANTITY_EVENT)
  updateQuantity(event: ApplicationEvent<typeof COFFEE_ORDER_QUANTITY_EVENT>): void {
    if (!Number.isFinite(event.data.quantity) || event.data.quantity < 1) {
      return;
    }
    this.quantity = event.data.quantity;
    this.refreshButtonLabel();
  }

  /**
   * Creates the payment link from the captured form values and redirects to Razorpay.
   *
   * The action-button registry calls this after the shared button captures the
   * form's `FormData`. A blank name falls back to an anonymous label because the
   * backend rejects empty contributor names; a successful response carries the
   * hosted payment URL the browser is sent to.
   *
   * @param payload - Form values supplied by the registered action.
   */
  private async submitOrder(payload: ActionButtonPayload): Promise<void> {
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const size = this.getSelectedSize();

    const link = await this.orderService.createPaymentLink({
      amount: size.price * this.quantity * 100,
      name: name || "Anonymous",
      shortNote: note || undefined,
    });
    window.location.assign(link.short_url);
  }

  /** Resolves the current size ID to the authored option used in checkout copy. */
  private getSelectedSize(): CoffeeSize {
    return coffeeContent.sizes.find((size) => size.id === this.selectedSizeId) ?? coffeeContent.sizes[1];
  }

  /** Calculates the charged amount in rupees from the selected order. */
  private getTotal(): number {
    return this.getSelectedSize().price * this.quantity;
  }

  /** Updates the shared button's idle label so it always names the current total. */
  private refreshButtonLabel(): void {
    const label = coffeeContent.order.submitLabel.replace("{total}", `$${this.getTotal().toFixed(0)}`);
    this.querySelector<HTMLElement>("#coffee-checkout-button")?.setAttribute("label", label);
  }

  /** Returns the optional feedback fields and the shared checkout action. */
  render(): string {
    const content = coffeeContent.order;

    return HTML`
      <form class="coffee-details-card">
        <label class="form-label form-label"><span>${content.nameLabel}</span><input class="form-control input-md input-rounded-md input-bordered" name="name" type="text" autocomplete="name" placeholder="${content.namePlaceholder}" /></label>
        <label class="form-label form-label"><span>${content.noteLabel}</span><textarea class="form-control input-md input-rounded-md input-bordered" name="note" rows="3" placeholder="${content.notePlaceholder}"></textarea></label>
        <div class="coffee-order-cta">
          <action-button
            id="coffee-checkout-button"
            action="coffee.order"
            variant="accent"
            label="${content.submitLabel.replace("{total}", `$${this.getTotal().toFixed(0)}`)}"
            busy-label="${content.submittingLabel}"
            done-label="${content.redirectingLabel}"
            fail-label="${content.failLabel}"
          ></action-button>
          <p>${content.checkoutNotice}</p>
        </div>
      </form>
    `;
  }
}
