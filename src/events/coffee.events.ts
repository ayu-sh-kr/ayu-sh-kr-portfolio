/** Published when a visitor chooses one of the authored coffee sizes. */
export const COFFEE_ORDER_SIZE_EVENT = "coffee:order-size" as const;

/** Published whenever a preset or custom coffee quantity becomes the active selection. */
export const COFFEE_ORDER_QUANTITY_EVENT = "coffee:order-quantity" as const;

/** Published after the demo checkout button replaces the optional feedback form with confirmation. */
export const COFFEE_ORDER_COMPLETE_EVENT = "coffee:order-complete" as const;

/** Published by the confirmation action to restore the coffee flow's initial selections. */
export const COFFEE_ORDER_RESET_EVENT = "coffee:order-reset" as const;

/**
 * The authored coffee size selected by the visitor.
 *
 * The size picker publishes this compact payload; the total and checkout
 * components consume it independently so neither needs to query picker DOM.
 */
export interface CoffeeOrderSizeSelection {
  /** Stable ID from `coffeeContent.sizes`, not the visible coffee name. */
  sizeId: string;
}

/**
 * The quantity selected for the current coffee size.
 *
 * Both the total and checkout use this payload to stay synchronized while the
 * quantity picker keeps input focus local during custom-number entry.
 */
export interface CoffeeOrderQuantitySelection {
  /** Positive number of coffees selected by a preset button or the custom input. */
  quantity: number;
  /** Whether the quantity originated from the inline custom input. */
  isCustom: boolean;
}
