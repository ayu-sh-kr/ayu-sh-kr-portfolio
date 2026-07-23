import { BaseElement, Component, HTML, State } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_ESTIMATOR_STAGE_EVENT,
  PRICING_ESTIMATOR_TYPE_EVENT,
  type PricingEstimatorSelection,
} from "@app/events/pricing.events.ts";

const formatCurrency = (value: number): string =>
  `$${Math.round(value / 100) * 100}`.replace(/(\d)(?=(\d{3})+$)/g, "$1,");

@Component({
  selector: "pricing-estimator-result",
  shadow: false,
})
export class PricingEstimatorResultComponent extends BaseElement {
  @State()
  selectedTypeId: string = pricingContent.estimator.types[0].id;

  @State()
  selectedStageId: string = pricingContent.estimator.stages[0].id;

  private flashFrame: number | null = null;
  private flashTimer: number | null = null;

  constructor() {
    super();
  }

  @OnEvent(PRICING_ESTIMATOR_TYPE_EVENT)
  onTypeSelected(event: ApplicationEvent<typeof PRICING_ESTIMATOR_TYPE_EVENT>): void {
    if (!this.isKnownType(event.data)) {
      return;
    }

    this.selectedTypeId = event.data.id;
    this.flash();
  }

  @OnEvent(PRICING_ESTIMATOR_STAGE_EVENT)
  onStageSelected(event: ApplicationEvent<typeof PRICING_ESTIMATOR_STAGE_EVENT>): void {
    if (!this.isKnownStage(event.data)) {
      return;
    }

    this.selectedStageId = event.data.id;
    this.flash();
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    if (this.flashFrame !== null) {
      window.cancelAnimationFrame(this.flashFrame);
      this.flashFrame = null;
    }

    if (this.flashTimer !== null) {
      window.clearTimeout(this.flashTimer);
      this.flashTimer = null;
    }
  }

  private isKnownType(selection: PricingEstimatorSelection): boolean {
    return pricingContent.estimator.types.some((type) => type.id === selection.id);
  }

  private isKnownStage(selection: PricingEstimatorSelection): boolean {
    return pricingContent.estimator.stages.some((stage) => stage.id === selection.id);
  }

  private flash(): void {
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

  private selectedType(): (typeof pricingContent.estimator.types)[number] {
    return (
      pricingContent.estimator.types.find((type) => type.id === this.selectedTypeId) ??
      pricingContent.estimator.types[0]
    );
  }

  private selectedStage(): (typeof pricingContent.estimator.stages)[number] {
    return (
      pricingContent.estimator.stages.find((stage) => stage.id === this.selectedStageId) ??
      pricingContent.estimator.stages[0]
    );
  }

  render(): string {
    const type = this.selectedType();
    const stage = this.selectedStage();
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
          <a class="pricing-estimator-button" href="#pricing-contact">${content.quoteCta} <span aria-hidden="true">→</span></a>
          <p>${content.reassurance}</p>
        </div>
      </div>
    `;
  }
}
