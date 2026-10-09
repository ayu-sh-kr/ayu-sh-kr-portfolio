import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";
import {actionButtonRegistry} from "@app/service/action-button-registry.service.ts";
import {coffeeOrderService} from "@app/service/coffee-order/coffee-order.service.ts";
import type {CoffeeCheckoutVerification} from "@app/service/coffee-order/coffee-order.service.ts";
import {CoffeeSizePickerComponent} from "./coffee-size-picker/coffee-size-picker.component.ts";
import {CoffeeQuantityPickerComponent} from "./coffee-quantity-picker/coffee-quantity-picker.component.ts";
import {CoffeeOrderCheckoutComponent} from "./coffee-order-checkout/coffee-order-checkout.component.ts";

const checkout = vi.hoisted(() => ({
  options: undefined as {handler: (result: CoffeeCheckoutVerification) => Promise<void>} | undefined,
  open: vi.fn(),
}));

vi.mock("@ayu-sh-kr/dota-wrap/core", () => ({
  BaseElement: class extends HTMLElement { updateHTML() {} },
  Component: () => () => {},
  BindEvent: () => () => {},
  ApplicationEventService: {getInstance: () => ({getPublisher: () => ({publishAsync: vi.fn()})})},
}));
vi.mock("@ayu-sh-kr/dota-wrap/event", () => ({OnEvent: () => () => {}}));
vi.mock("@app/utils/analytics.utils.ts", () => ({publishAnalyticsEvent: vi.fn()}));
vi.mock("@app/service/action-button-registry.service.ts", () => ({actionButtonRegistry: {registerHandler: vi.fn(() => vi.fn())}}));
vi.mock("@app/service/coffee-order/coffee-order.service.ts", () => ({coffeeOrderService: {
  createCheckoutOrder: vi.fn(), verifyCheckout: vi.fn(), createPaymentLink: vi.fn(),
}}));
vi.mock("@app/service/coffee-order/coffee-pricing.service.ts", () => ({
  coffeePricingService: {getCurrency: vi.fn(async () => "USD")}, formatCoffeeAmount: vi.fn(),
}));
vi.mock("@razorpay/razorpay-js/checkout", () => ({default: vi.fn(async (options) => {
  checkout.options = options;
  return {open: checkout.open};
})}));

customElements.define("test-coffee-size", CoffeeSizePickerComponent);
customElements.define("test-coffee-quantity", CoffeeQuantityPickerComponent);
customElements.define("test-coffee-checkout", CoffeeOrderCheckoutComponent);

describe("coffee analytics", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    checkout.options = undefined;
    vi.stubEnv("VITE_RAZORPAY_CHECKOUT_MODE", "checkout");
  });

  it("does not track initial defaults but does track a tap on the selected amount and quantity", () => {
    const size = new CoffeeSizePickerComponent();
    const quantity = new CoffeeQuantityPickerComponent();
    expect(publishAnalyticsEvent).not.toHaveBeenCalled();
    const sizeButton = document.createElement("button");
    sizeButton.dataset.coffeeSize = "latte";
    size.selectSize({target: sizeButton} as unknown as MouseEvent);
    const quantityButton = document.createElement("button");
    quantityButton.dataset.coffeeQuantity = "1";
    quantity.selectQuantity({target: quantityButton} as unknown as MouseEvent);
    expect(publishAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "coffee_amount_selected", params: expect.objectContaining({size_id: "latte", currency: "USD"}),
    });
    expect(publishAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "coffee_quantity_selected", params: {quantity: 1, is_custom: false},
    });
  });

  it("tracks optional form completion once without sending the field contents", () => {
    const form = new CoffeeOrderCheckoutComponent();
    const input = document.createElement("input");
    input.value = "   ";
    form.trackFormFilled({target: input} as unknown as Event);
    expect(publishAnalyticsEvent).not.toHaveBeenCalled();
    input.value = "Supporter private name";
    form.trackFormFilled({target: input} as unknown as Event);
    input.value = "Supporter private note";
    form.trackFormFilled({target: input} as unknown as Event);
    expect(publishAnalyticsEvent).toHaveBeenCalledExactlyOnceWith({eventName: "coffee_form_filled", params: {}});
  });

  it.each([true, false])("reports success only after verification succeeds (%s)", async (verified) => {
    vi.mocked(coffeeOrderService.createCheckoutOrder).mockResolvedValue({
      key: "key", orderId: "order", amount: 500, currency: "USD", name: "Coffee", description: "Support",
    });
    const form = new CoffeeOrderCheckoutComponent();
    form.onConnected();
    const handler = vi.mocked(actionButtonRegistry.registerHandler).mock.calls[0]![1];
    const payment = handler({name: "Private supporter", note: "Private note"});
    await vi.waitFor(() => expect(checkout.open).toHaveBeenCalled());
    expect(publishAnalyticsEvent).toHaveBeenCalledWith({eventName: "coffee_payment_button_clicked", params: {}});
    expect(publishAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "coffee_payment_started", params: expect.objectContaining({value: 5, currency: "USD"}),
    });
    expect(vi.mocked(publishAnalyticsEvent).mock.calls.some(([event]) => event.eventName === "coffee_payment_success")).toBe(false);
    let completeVerification!: () => void;
    let rejectVerification!: (error: Error) => void;
    vi.mocked(coffeeOrderService.verifyCheckout).mockReturnValue(new Promise<void>((resolve, reject) => {
      completeVerification = resolve;
      rejectVerification = reject;
    }));
    const result = {razorpay_payment_id: "payment", razorpay_order_id: "order", razorpay_signature: "signature"};
    const verification = checkout.options!.handler(result);
    expect(vi.mocked(publishAnalyticsEvent).mock.calls.some(([event]) => event.eventName === "coffee_payment_success")).toBe(false);
    const settled = verified ? expect(payment).resolves.toBeUndefined() : expect(payment).rejects.toThrow("Verification failed");
    if (verified) completeVerification();
    else rejectVerification(new Error("Verification failed"));
    await verification;
    await settled;
    expect(vi.mocked(publishAnalyticsEvent).mock.calls.filter(([event]) => event.eventName === "coffee_payment_success")).toHaveLength(verified ? 1 : 0);
    form.onDisconnected();
  });
});
