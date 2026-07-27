import { ApplicationEventService, BaseElement, Component, HostListener, HTML, State } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";
import { PRICING_ESTIMATOR_STAGE_EVENT } from "@app/events/pricing.events.ts";

/**
 * Renders the estimator's project-stage choices and publishes valid selections.
 *
 * The selected stage is local UI state; {@link PRICING_ESTIMATOR_STAGE_EVENT}
 * carries changes to the result component, which owns the calculated estimate.
 *
 * Selector: `pricing-estimator-stage-options`.
 */
@Component({
  selector: "pricing-estimator-stage-options",
  shadow: false,
})
export class PricingEstimatorStageOptionsComponent extends BaseElement {
  /** Current estimator stage ID; changing it updates the selected button in render. */
  @State()
  selectedId: string = pricingContent.estimator.stages[0].id;

  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  constructor() {
    super();
  }

  /**
   * Publishes a changed project stage after validating the clicked estimator button.
   * @param event - Host click whose closest estimator button supplies the stage ID.
   */
  @HostListener({ event: "click" })
  selectStage(event: MouseEvent): void {
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
      name: PRICING_ESTIMATOR_STAGE_EVENT,
      data: { id: selectedId },
    });
  }

  /** Returns all project-stage choices with the current selection marked active. */
  render(): string {
    const content = pricingContent.estimator;

    return HTML`
      <fieldset class="pricing-estimator-question">
        <legend><span>${content.stageStep}</span>${content.stageQuestion}</legend>
        <div class="pricing-pick-grid pricing-pick-grid-three">
          ${content.stages
            .map(
              (option) => `
                <button class="pricing-pick ${option.id === this.selectedId ? "is-selected" : ""}" type="button" data-estimator-id="${option.id}" aria-pressed="${option.id === this.selectedId}">
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
