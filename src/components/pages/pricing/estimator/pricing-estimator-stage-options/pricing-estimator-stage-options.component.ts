import { ApplicationEventService, BaseElement, Component, HostListener, HTML, State } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";
import { PRICING_ESTIMATOR_STAGE_EVENT } from "@app/events/pricing.events.ts";

/**
 * Renders the estimator's project-stage choices and publishes valid selections.
 *
 * This is the publishing half of the estimator's stage flow. Selection is held
 * as local {@link State} so the active button updates immediately on click
 * without waiting for a round-trip; the change is then broadcast as
 * {@link PRICING_ESTIMATOR_STAGE_EVENT} for `pricing-estimator-result` to
 * recalculate the estimate. The component never computes the estimate itself
 * and never reads the type selection — each selector owns one axis and the
 * result component reconciles both.
 *
 * Selector: `pricing-estimator-stage-options`.
 */
@Component({
  selector: "pricing-estimator-stage-options",
  shadow: false,
})
export class PricingEstimatorStageOptionsComponent extends BaseElement {
  /**
   * Current estimator stage ID.
   *
   * Defaults to the first authored stage so one option is active from the first
   * paint. Stored as the authored `id` and compared directly against each
   * button's `data-estimator-id` to mark the active one in {@link render};
   * re-selecting the same id is a no-op (see {@link selectStage}) so the event is
   * not republished needlessly.
   */
  @State()
  selectedId: string = pricingContent.estimator.stages[0].id;

  /**
   * Publisher used to broadcast stage selections to the result component.
   *
   * Acquired once from the shared {@link ApplicationEventService} and reused for
   * every change, so this selector and the result component stay decoupled —
   * neither holds a direct reference to the other.
   */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /**
   * Creates the stage-options component with the first authored stage selected.
   *
   * The default is seeded from {@link pricingContent} so the first paint already
   * shows an active stage, matching the result component's default and keeping
   * the initial estimate internally consistent.
   */
  constructor() {
    super();
  }

  /**
   * Publishes a changed project stage after validating the clicked estimator button.
   *
   * A single delegated `click` listener covers every stage button, so no
   * per-item handlers are wired or torn down as the grid renders. The handler
   * climbs to the closest `button[data-estimator-id]` and confirms it still
   * belongs to this component before acting, which keeps the listener safe even
   * if the rendered grid is replaced mid-click. Re-selecting the already-active
   * stage is detected and skipped, so the result component is not asked to
   * recalculate for a no-op. Only a genuine change updates {@link selectedId}
   * and publishes {@link PRICING_ESTIMATOR_STAGE_EVENT}.
   *
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

  /**
   * Returns all project-stage choices with the current selection marked active.
   *
   * Stages are rendered as a `<fieldset>`/`<legend>` pair so the question is
   * announced as a group by assistive tech, and each button carries
   * `aria-pressed` so the active stage is conveyed without relying on color
   * alone. Authored in {@link pricingContent} and iterated here so adding a
   * stage is a content change, not a code change.
   */
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
