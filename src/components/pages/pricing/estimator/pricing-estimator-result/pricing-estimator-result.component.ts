import { BaseElement, Component, HTML, State } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_ESTIMATOR_STAGE_EVENT,
  PRICING_ESTIMATOR_TYPE_EVENT,
  type PricingEstimatorSelection,
} from "@app/events/pricing.events.ts";

/**
 * Rounds an estimate to the nearest hundred and formats it as a US dollar value.
 *
 * Used only for display, so the rounding is a presentation choice rather than a
 * pricing commitment: snapping to the nearest hundred keeps the figure readable
 * and signals that this is an estimate, not a quote. The regex adds thousands
 * separators after the rounding pass, so `12500` becomes `$12,500`.
 */
const formatCurrency = (value: number): string =>
  `$${Math.round(value / 100) * 100}`.replace(/(\d)(?=(\d{3})+$)/g, "$1,");

/**
 * Calculates and renders the estimator range from the selected type and stage.
 *
 * This is the consuming half of the estimator's pub/sub pair. The two selector
 * components publish {@link PRICING_ESTIMATOR_TYPE_EVENT} and
 * {@link PRICING_ESTIMATOR_STAGE_EVENT}; this component subscribes to both,
 * validates each payload against the authored options, and recalculates the
 * range from the selected type's `base` and the selected stage's `multiplier`.
 * Selection is the only input that drives a recalculation, so the figure always
 * reflects the latest authored data plus the visitor's two choices.
 *
 * After a valid change the result figure is flashed briefly (see
 * {@link flashResult}) to draw the eye back to the updated number. Pending
 * animation frames and timers are cancelled on disconnect so a hot teardown
 * cannot leave a stale frame or timer mutating the DOM after the element is gone.
 *
 * Selector: `pricing-estimator-result`.
 */
@Component({
  selector: "pricing-estimator-result",
  shadow: false,
})
export class PricingEstimatorResultComponent extends BaseElement {
  /**
   * Selected build type used as the estimate's base value.
   *
   * Defaults to the first authored type so a range renders before the visitor
   * picks anything. Stored as the authored `id` and resolved to the full type
   * record by {@link getSelectedType} at render time, so the estimate always
   * reads current authored data even if the content is updated in place.
   */
  @State()
  selectedTypeId: string = pricingContent.estimator.types[0].id;

  /**
   * Selected project stage used as the estimate's multiplier.
   *
   * Defaults to the first authored stage for the same reason as
   * {@link selectedTypeId}; resolved to the full stage record by
   * {@link getSelectedStage} at render time.
   */
  @State()
  selectedStageId: string = pricingContent.estimator.stages[0].id;

  /**
   * Handle of the pending `requestAnimationFrame` driving the current flash.
   *
   * Held so it can be cancelled if a new selection arrives before the frame
   * fires, and on disconnect. `null` whenever no frame is pending.
   */
  private flashFrame: number | null = null;

  /**
   * Handle of the pending `setTimeout` that ends the current flash.
   *
   * Held so it can be cancelled (and the `is-flashing` class removed promptly)
   * if a new selection restarts the flash, and on disconnect. `null` whenever
   * no timer is pending.
   */
  private flashTimer: number | null = null;

  /**
   * Creates the result component with the first authored type and stage selected.
   *
   * Defaults are seeded from {@link pricingContent} so the first paint already
   * shows a meaningful range; the visitor's choices then override them via the
   * event handlers.
   */
  constructor() {
    super();
  }

  /**
   * Applies a valid type selection and flashes the recalculated result.
   *
   * Subscribes to {@link PRICING_ESTIMATOR_TYPE_EVENT}, published by
   * `pricing-estimator-type-options`. The payload is validated against the
   * authored type IDs via {@link isKnownType} so a malformed or stale event can
   * never produce a range for a type that no longer exists; unknown events are
   * dropped silently rather than shown as an error, since the visitor never sees
   * them. On a known type the state is updated and {@link flashResult} re-flags
   * the figure so the eye is drawn to the new number.
   *
   * @param event - Typed estimator event carrying the authored type ID.
   */
  @OnEvent(PRICING_ESTIMATOR_TYPE_EVENT)
  renderTypeSelection(event: ApplicationEvent<typeof PRICING_ESTIMATOR_TYPE_EVENT>): void {
    if (!this.isKnownType(event.data)) {
      return;
    }

    this.selectedTypeId = event.data.id;
    this.flashResult();
  }

  /**
   * Applies a valid stage selection and flashes the recalculated result.
   *
   * Subscribes to {@link PRICING_ESTIMATOR_STAGE_EVENT}, published by
   * `pricing-estimator-stage-options`. Same validation contract as
   * {@link renderTypeSelection}: the payload is checked against the authored
   * stage IDs via {@link isKnownStage}, and unknown events are dropped silently.
   * On a known stage the state is updated and the figure is flashed.
   *
   * @param event - Typed estimator event carrying the authored stage ID.
   */
  @OnEvent(PRICING_ESTIMATOR_STAGE_EVENT)
  renderStageSelection(event: ApplicationEvent<typeof PRICING_ESTIMATOR_STAGE_EVENT>): void {
    if (!this.isKnownStage(event.data)) {
      return;
    }

    this.selectedStageId = event.data.id;
    this.flashResult();
  }

  /**
   * Cancels result feedback animation and timers when the component disconnects.
   *
   * Runs once on disconnect (the `true` flag makes it a one-shot lifecycle hook).
   * Without this, a pending animation frame or timer could fire after the element
   * is gone and try to query or mutate detached DOM, or leave the `is-flashing`
   * class applied to an element that no longer re-renders. Both handles are
   * reset to `null` so the component is left in a clean state if it is ever
   * reconnected.
   */
  @OnEvent("disconnected", true)
  cleanupResultFeedback(): void {
    if (this.flashFrame !== null) {
      window.cancelAnimationFrame(this.flashFrame);
      this.flashFrame = null;
    }

    if (this.flashTimer !== null) {
      window.clearTimeout(this.flashTimer);
      this.flashTimer = null;
    }
  }

  /**
   * Checks that an event payload names an authored estimator type.
   *
   * The defense-in-depth check that gates {@link renderTypeSelection}: only IDs
   * present in {@link pricingContent.estimator.types} are accepted, so a stale
   * event (or a hand-crafted one) cannot drive the estimate to a type the page
   * no longer shows. Kept as a separate helper so the same validation pattern is
   * visible and testable independently of the handler.
   *
   * @param selection - Event payload to compare with the authored type IDs.
   */
  private isKnownType(selection: PricingEstimatorSelection): boolean {
    return pricingContent.estimator.types.some((type) => type.id === selection.id);
  }

  /**
   * Checks that an event payload names an authored estimator stage.
   *
   * The stage counterpart of {@link isKnownType}: only IDs present in
   * {@link pricingContent.estimator.stages} are accepted. Same rationale — a
   * stale or malformed event cannot produce a range for a stage the page no
   * longer offers.
   *
   * @param selection - Event payload to compare with the authored stage IDs.
   */
  private isKnownStage(selection: PricingEstimatorSelection): boolean {
    return pricingContent.estimator.stages.some((stage) => stage.id === selection.id);
  }

  /**
   * Adds a short visual flash to the estimate figure after a valid selection.
   *
   * The flash is driven through two cooperating timers so a rapid second
   * selection does not stack effects. The previous frame (if any) is cancelled
   * before the new one is requested, and inside the frame the previous end-timer
   * is cancelled before the new one is set — so the `is-flashing` class is
   * always removed exactly once, even under fast repeated selections. The
   * figure is queried lazily inside the frame (not captured up front) so a
   * re-render that replaced the figure between the selection and the frame still
   * finds the current element. If the figure is absent the class is simply not
   * applied, and the timer path is skipped.
   */
  private flashResult(): void {
    if (this.flashFrame !== null) {
      window.cancelAnimationFrame(this.flashFrame);
    }

    this.flashFrame = window.requestAnimationFrame(() => {
      this.flashFrame = null;
      const figure = this.querySelector<HTMLElement>(".pricing-estimator-figure");
      if (!figure) {
        return;
      }

      figure.classList.add("is-flashing");
      if (this.flashTimer !== null) {
        window.clearTimeout(this.flashTimer);
      }
      this.flashTimer = window.setTimeout(() => {
        figure.classList.remove("is-flashing");
        this.flashTimer = null;
      }, 260);
    });
  }

  /**
   * Resolves the selected type, falling back to the first authored option.
   *
   * The fallback is defensive: {@link selectedTypeId} is always seeded from
   * authored data and only ever set to an ID that passed {@link isKnownType}, so
   * the `??` branch should never trigger in normal operation. It exists so a
   * content edit that removed the selected type mid-session degrades gracefully
   * to the first option instead of crashing the render.
   */
  private getSelectedType(): (typeof pricingContent.estimator.types)[number] {
    return (
      pricingContent.estimator.types.find((type) => type.id === this.selectedTypeId) ??
      pricingContent.estimator.types[0]
    );
  }

  /**
   * Resolves the selected stage, falling back to the first authored option.
   *
   * Stage counterpart of {@link getSelectedType}; same defensive fallback for
   * the same reason.
   */
  private getSelectedStage(): (typeof pricingContent.estimator.stages)[number] {
    return (
      pricingContent.estimator.stages.find((stage) => stage.id === this.selectedStageId) ??
      pricingContent.estimator.stages[0]
    );
  }

  /**
   * Returns the current estimate range and the breakdown that produced it.
   *
   * Reads the resolved type and stage fresh on every render, so the figure
   * always reflects current authored data. The low end is `type.base * stage.multiplier`
   * and the high end is 1.5× the low — a fixed band ratio that signals "estimate"
   * rather than a quoted price. The figure lives in an `aria-live="polite"`
   * region so screen-reader users hear the new range without moving focus, and
   * the breakdown below names the two inputs that produced it so the visitor can
   * trace how their choices map to the number. The CTA links to the
   * start-project section so the estimate flows directly into the intake.
   */
  render(): string {
    const type = this.getSelectedType();
    const stage = this.getSelectedStage();
    const content = pricingContent.estimator;
    const low = type.base * stage.multiplier;
    const high = low * 1.5;

    return HTML`
      <div class="pricing-estimator-result">
        <div class="pricing-estimator-result-main">
          <p class="pricing-estimator-result-eyebrow">${content.resultEyebrow}</p>
          <p class="pricing-estimator-figure" aria-live="polite">${formatCurrency(low)} – ${formatCurrency(high)}</p>
          <p class="pricing-estimator-subline">${type.description.replace(/\.$/, "")} — for ${stage.note}.</p>
        </div>
        <div class="pricing-estimator-breakdown" aria-label="${content.breakdownAriaLabel}">
          <span>${content.breakdownBuildingLabel} <b>${type.label}</b></span>
          <span>${content.breakdownStageLabel} <b>${stage.label}</b></span>
        </div>
        <div class="pricing-estimator-cta">
          <a class="app-link app-link--button app-link--accent app-link--full" href="#pricing-start-project">${content.quoteCta} <span aria-hidden="true">→</span></a>
          <p>${content.reassurance}</p>
        </div>
      </div>
    `;
  }
}
