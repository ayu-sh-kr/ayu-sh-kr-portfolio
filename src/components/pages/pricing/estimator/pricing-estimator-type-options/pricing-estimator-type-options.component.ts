import { ApplicationEventService, BaseElement, Component, HostListener, HTML, State } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";
import { PRICING_ESTIMATOR_TYPE_EVENT } from "@app/events/pricing.events.ts";

/**
 * Renders the estimator's build-type choices and publishes valid selections.
 *
 * This is the publishing half of the estimator's type flow, and the structural
 * mirror of `pricing-estimator-stage-options`. Selection is held as local
 * {@link State} so the active button updates immediately on click; the change
 * is then broadcast as {@link PRICING_ESTIMATOR_TYPE_EVENT} for
 * `pricing-estimator-result` to recalculate the estimate. The component owns
 * only the type axis and never reads the stage selection — the two selectors
 * stay independent and the result component reconciles both.
 *
 * Selector: `pricing-estimator-type-options`.
 */
@Component({
  selector: "pricing-estimator-type-options",
  shadow: false,
})
export class PricingEstimatorTypeOptionsComponent extends BaseElement {
  /**
   * Current estimator type ID.
   *
   * Defaults to the first authored type so one option is active from the first
   * paint. Stored as the authored `id` and compared directly against each
   * button's `data-estimator-id` to mark the active one in {@link render};
   * re-selecting the same id is a no-op (see {@link selectType}) so the event is
   * not republished needlessly.
   */
  @State()
  selectedId: string = pricingContent.estimator.types[0].id;

  /**
   * Publisher used to broadcast type selections to the result component.
   *
   * Acquired once from the shared {@link ApplicationEventService} and reused for
   * every change, keeping this selector decoupled from the result component that
   * subscribes to its events.
   */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /**
   * Creates the type-options component with the first authored type selected.
   *
   * The default is seeded from {@link pricingContent} so the first paint already
   * shows an active type, matching the result component's default and keeping
   * the initial estimate internally consistent.
   */
  constructor() {
    super();
  }

  /**
   * Publishes a changed build type after validating the clicked estimator button.
   *
   * A single delegated `click` listener covers every type button, so no
   * per-item handlers are wired or torn down as the grid renders. The handler
   * climbs to the closest `button[data-estimator-id]` and confirms it still
   * belongs to this component before acting, which keeps the listener safe even
   * if the rendered grid is replaced mid-click. Re-selecting the already-active
   * type is detected and skipped, so the result component is not asked to
   * recalculate for a no-op. Only a genuine change updates {@link selectedId}
   * and publishes {@link PRICING_ESTIMATOR_TYPE_EVENT}.
   *
   * @param event - Host click whose closest estimator button supplies the type ID.
   */
  @HostListener({ event: "click" })
  selectType(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-estimator-id]");
    if (!button || !this.contains(button)) {
      return;
    }

    const selectedId = button.dataset.estimatorId;
    if (!selectedId || selectedId === this.selectedId) {
      return;
    }

    this.selectedId = selectedId;
    void this.publisher.publishAsync({
      name: PRICING_ESTIMATOR_TYPE_EVENT,
      data: { id: selectedId },
    });
  }

  /**
   * Returns all build-type choices with the current selection marked active.
   *
   * Types are rendered as a `<fieldset>`/`<legend>` pair so the question is
   * announced as a group by assistive tech, and each button carries
   * `aria-pressed` so the active type is conveyed without relying on color
   * alone. Each option surfaces an icon, label, and sublabel from
   * {@link pricingContent}, so adding a type is a content change, not a code
   * change.
   */
  render(): string {
    const content = pricingContent.estimator;

    return HTML`
      <fieldset class="pricing-estimator-question">
        <legend><span>${content.typeStep}</span>${content.typeQuestion}</legend>
        <div class="pricing-pick-grid">
          ${content.types
            .map(
              (option) => `
                <button class="form-choice input-lg input-rounded-md input-bordered pricing-pick ${option.id === this.selectedId ? "is-selected" : ""}" type="button" data-estimator-id="${option.id}" aria-pressed="${option.id === this.selectedId}">
                  <span class="pricing-pick-icon">${option.icon}</span>
                  <span class="pricing-pick-label">${option.label}</span>
                  <span class="pricing-pick-sublabel">${option.sublabel}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      </fieldset>
    `;
  }
}
