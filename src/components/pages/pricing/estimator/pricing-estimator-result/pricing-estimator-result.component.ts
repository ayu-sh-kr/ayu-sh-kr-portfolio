import { BaseElement, Component, HTML, State } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_ESTIMATOR_STAGE_EVENT,
  PRICING_ESTIMATOR_TYPE_EVENT,
  type PricingEstimatorSelection,
} from "@app/events/pricing.events.ts";

/** Rounds an estimate to the nearest hundred and formats it as a US dollar value. */
const formatCurrency = (value: number): string =>
  `$${Math.round(value / 100) * 100}`.replace(/(\d)(?=(\d{3})+$)/g, "$1,");

/**
 * Calculates and renders the estimator range from the selected type and stage.
 *
 * It consumes {@link PRICING_ESTIMATOR_TYPE_EVENT} and
 * {@link PRICING_ESTIMATOR_STAGE_EVENT}, validates each payload against the
 * authored options, and flashes the result figure after a valid change. Pending
 * animation frames and timers are cancelled on disconnect.
 *
 * Selector: `pricing-estimator-result`.
 */
@Component({
  selector: "pricing-estimator-result",
  shadow: false,
})
export class PricingEstimatorResultComponent extends BaseElement {
  /** Selected build type used as the estimate's base value. */
  @State()
  selectedTypeId: string = pricingContent.estimator.types[0].id;

  /** Selected project stage used as the estimate's multiplier. */
  @State()
  selectedStageId: string = pricingContent.estimator.stages[0].id;

  private flashFrame: number | null = null;
  private flashTimer: number | null = null;

  constructor() {
    super();
  }

  /**
   * Applies a valid type selection and flashes the recalculated result.
   * @param event - Typed estimator event containing the authored type ID.
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
   * @param event - Typed estimator event containing the authored stage ID.
   */
  @OnEvent(PRICING_ESTIMATOR_STAGE_EVENT)
  renderStageSelection(event: ApplicationEvent<typeof PRICING_ESTIMATOR_STAGE_EVENT>): void {
    if (!this.isKnownStage(event.data)) {
      return;
    }

    this.selectedStageId = event.data.id;
    this.flashResult();
  }

  /** Cancels result feedback animation and timers when the component disconnects. */
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
   * @param selection - Event payload to compare with the authored type IDs.
   */
  private isKnownType(selection: PricingEstimatorSelection): boolean {
    return pricingContent.estimator.types.some((type) => type.id === selection.id);
  }

  /**
   * Checks that an event payload names an authored estimator stage.
   * @param selection - Event payload to compare with the authored stage IDs.
   */
  private isKnownStage(selection: PricingEstimatorSelection): boolean {
    return pricingContent.estimator.stages.some((stage) => stage.id === selection.id);
  }

  /** Adds a short visual flash to the estimate figure after a valid selection. */
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

  /** Resolves the selected type, falling back to the first authored option. */
  private getSelectedType(): (typeof pricingContent.estimator.types)[number] {
    return (
      pricingContent.estimator.types.find((type) => type.id === this.selectedTypeId) ??
      pricingContent.estimator.types[0]
    );
  }

  /** Resolves the selected stage, falling back to the first authored option. */
  private getSelectedStage(): (typeof pricingContent.estimator.stages)[number] {
    return (
      pricingContent.estimator.stages.find((stage) => stage.id === this.selectedStageId) ??
      pricingContent.estimator.stages[0]
    );
  }

  /** Returns the current estimate range and the breakdown that produced it. */
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
          <a class="pricing-estimator-button" href="#pricing-start-project">${content.quoteCta} <span aria-hidden="true">→</span></a>
          <p>${content.reassurance}</p>
        </div>
      </div>
    `;
  }
}
