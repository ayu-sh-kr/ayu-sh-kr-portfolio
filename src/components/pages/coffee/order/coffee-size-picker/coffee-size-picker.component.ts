import { ApplicationEventService, BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { COFFEE_ORDER_SIZE_EVENT, type CoffeeOrderSizeSelection } from "@app/events/coffee.events.ts";

/**
 * Presents the authored coffee-size cards and publishes the active choice.
 *
 * The picker owns only its selected-card affordance. Its event is consumed by
 * the total and checkout components, keeping price calculation outside this
 * input element and allowing it to remain reusable in another support flow.
 *
 * Selector: `coffee-size-picker`.
 */
@Component({
  selector: "coffee-size-picker",
  shadow: false,
})
export class CoffeeSizePickerComponent extends BaseElement {
  /** Application-wide publisher used to share a size choice with dependent order elements. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Stable default size selected when the coffee order first renders or resets. */
  private selectedSizeId = "latte";

  /** Creates the picker before the framework binds its delegated card click handler. */
  constructor() {
    super();
  }

  /**
   * Marks a clicked authored size as active and publishes the new stable ID.
   * @param event - Click from a size card or one of its nested presentation spans.
   */
  @BindEvent({ event: "click", id: "[data-coffee-size]" })
  selectSize(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-coffee-size]");
    const sizeId = button?.dataset.coffeeSize;
    if (!sizeId || sizeId === this.selectedSizeId || !coffeeContent.sizes.some((size) => size.id === sizeId)) {
      return;
    }

    this.selectedSizeId = sizeId;
    this.updateHTML();
    void this.publisher.publishAsync({ name: COFFEE_ORDER_SIZE_EVENT, data: { sizeId } satisfies CoffeeOrderSizeSelection });
  }

  /** Returns the size cards with the current picker-local selection marked active. */
  render(): string {
    const content = coffeeContent.order;

    return HTML`
      <fieldset class="coffee-order-question">
        <legend><span>1</span>${content.sizeQuestion}</legend>
        <div class="coffee-pick-grid">
          ${coffeeContent.sizes.map((size) => `
            <button class="coffee-pick ${size.id === this.selectedSizeId ? "is-selected" : ""}" type="button" data-coffee-size="${size.id}" aria-pressed="${size.id === this.selectedSizeId}">
              ${size.featured ? `<span class="coffee-pick-flag">${size.featured}</span>` : ""}
              <span class="coffee-pick-title"><strong>$${size.price}</strong> ${size.name}</span>
              <span class="coffee-pick-description">${size.description}</span>
            </button>
          `).join("")}
        </div>
      </fieldset>
    `;
  }
}
