import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent, type CoffeeSize } from "@app/data/coffee-content.ts";
import { type ActionButtonPayload } from "@app/events/action-button.events.ts";
import { COFFEE_ORDER_QUANTITY_EVENT, COFFEE_ORDER_SIZE_EVENT, COFFEE_PAYMENT_SUCCESS_EVENT } from "@app/events/coffee.events.ts";
import { actionButtonRegistry } from "@app/service/action-button-registry.service.ts";
import { coffeeOrderService } from "@app/service/coffee-order/coffee-order.service.ts";
import type { CoffeeCheckoutVerification } from "@app/service/coffee-order/coffee-order.service.ts";
import { coffeePricingService, formatCoffeeAmount, type CoffeeCurrency } from "@app/service/coffee-order/coffee-pricing.service.ts";

/**
 * Owns the coffee order form and its real payment checkout.
 *
 * The optional name and note fields live in a native `<form>` so the shared
 * `action-button` captures them through `FormData`; this component never reads
 * another element's inputs. It tracks the selected size and quantity from the
 * picker events, registers the `coffee.order` handler, and opens Razorpay Standard
 * Checkout in-page. Pending, success, and failure
 * presentation are delegated to the shared action button.
 *
 * Selector: `coffee-order-checkout`.
 */
@Component({
  selector: "coffee-order-checkout",
  shadow: false,
})
export class CoffeeOrderCheckoutComponent extends BaseElement {
  /** Allows time for a visitor to complete the Razorpay modal before settling the action. */
  private static readonly CHECKOUT_TIMEOUT_MS = 15 * 60 * 1_000;

  /** Transport boundary shared with the buy-coffee backend. */
  private readonly orderService = coffeeOrderService;

  /** Current authored size ID used to compute the charged amount. */
  private selectedSizeId = "latte";

  /** Current quantity used to compute the charged amount. */
  private quantity = 1;

  /** Currency resolved from the backend locale endpoint for this browser session. */
  private currency: CoffeeCurrency = "USD";

  /** Registry cleanup returned for this form's submit action. */
  private removeHandler: (() => void) | null = null;

  /** Creates the checkout element before it begins receiving scoped order events. */
  constructor() {
    super();
  }

  /** Registers the payment handler so the shared action button can start checkout. */
  @OnEvent("connected", true)
  onConnected(): void {
    this.removeHandler = actionButtonRegistry.registerHandler(
      "coffee.order",
      (payload) => this.submitOrder(payload),
      CoffeeOrderCheckoutComponent.CHECKOUT_TIMEOUT_MS,
    );
    void coffeePricingService.getCurrency().then((currency) => {
      this.currency = currency;
      this.refreshButtonLabel();
    }).catch(() => undefined);
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
   * Creates the server order and opens the Razorpay Standard Checkout modal.
   *
   * The action-button registry calls this after the shared button captures the
   * form's `FormData`. A blank name falls back to an anonymous label because the
   * backend rejects empty contributor names; the success handler submits Razorpay's
   * signed payment values back to the backend before reporting completion.
   *
   * @param payload - Form values supplied by the registered action.
   */
  private async submitOrder(payload: ActionButtonPayload): Promise<void> {
    this.currency = await coffeePricingService.getCurrency();
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const size = this.getSelectedSize();

    const draft = {
      amount: size.price[this.currency] * this.quantity * 100,
      name: name || "Anonymous",
      shortNote: note || undefined,
    };
    if (import.meta.env.VITE_RAZORPAY_CHECKOUT_MODE === "payment-link") {
      const link = await this.orderService.createPaymentLink(draft);
      window.location.assign(link.short_url);
      return;
    }
    const [order, { default: RazorpayCheckout }] = await Promise.all([
      this.orderService.createCheckoutOrder(draft),
      import("@razorpay/razorpay-js/checkout"),
    ]);

    let completePayment!: () => void;
    let failPayment!: (reason: unknown) => void;
    let paymentSettled = false;
    const paymentResult = new Promise<void>((resolve, reject) => {
      completePayment = resolve;
      failPayment = reject;
    });
    const checkout = await RazorpayCheckout({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.orderId,
      prefill: { name: draft.name },
      theme: { backdrop_color: "#F4F1EA" },
      handler: async (result: CoffeeCheckoutVerification) => {
        try {
          await this.orderService.verifyCheckout(result);
          window.dispatchEvent(new Event(COFFEE_PAYMENT_SUCCESS_EVENT));
          paymentSettled = true;
          completePayment();
        } catch (error) {
          paymentSettled = true;
          failPayment(error);
        }
      },
      modal: {
        ondismiss: () => {
          if (!paymentSettled) {
            paymentSettled = true;
            failPayment(new Error("Checkout was closed before payment completed."));
          }
        },
      },
    });
    try {
      checkout.open();
    } catch (error) {
      paymentSettled = true;
      failPayment(error);
    }
    await paymentResult;
  }

  /** Resolves the current size ID to the authored option used in checkout copy. */
  private getSelectedSize(): CoffeeSize {
    return coffeeContent.sizes.find((size) => size.id === this.selectedSizeId) ?? coffeeContent.sizes[1];
  }

  /** Calculates the localized fixed contribution amount from the selected option and quantity. */
  private getTotal(): number {
    return this.getSelectedSize().price[this.currency] * this.quantity;
  }

  /** Updates the shared button's idle label so it always names the current total. */
  private refreshButtonLabel(): void {
    const label = coffeeContent.order.submitLabel.replace("{total}", formatCoffeeAmount(this.getTotal(), this.currency));
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
            label="${content.submitLabel.replace("{total}", formatCoffeeAmount(this.getTotal(), this.currency))}"
            busy-label="${content.submittingLabel}"
            done-label="${content.successLabel}"
            fail-label="${content.failLabel}"
          ></action-button>
          <p>${content.checkoutNotice}</p>
        </div>
      </form>
    `;
  }
}
