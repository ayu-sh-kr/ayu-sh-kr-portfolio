import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Shell that lays out the pricing estimator section and hosts its parts.
 *
 * The estimator is built from three independently stateful child elements, each
 * a separate custom element so its state survives this shell re-rendering:
 * `pricing-estimator-type-options` and `pricing-estimator-stage-options` publish
 * the visitor's choices as typed application events, and
 * `pricing-estimator-result` subscribes to those events and owns the calculated
 * range. This shell deliberately owns no selection or estimate state — it only
 * provides the section layout, the accessible heading, and the introductory
 * copy from {@link pricingContent}. That keeps the pub/sub pair between the
 * selectors and the result direct, with nothing routing through this shell.
 *
 * Selector: `pricing-estimator`.
 */
@Component({
  selector: "pricing-estimator",
  shadow: false,
})
export class PricingEstimatorComponent extends BaseElement {
  /**
   * Creates the estimator shell.
   *
   * No state is initialized here because the shell owns none; the child option
   * and result components hold their own selection and estimate state and
   * communicate through {@link PRICING_ESTIMATOR_TYPE_EVENT} and
   * {@link PRICING_ESTIMATOR_STAGE_EVENT}.
   */
  constructor() {
    super();
  }

  /**
   * Returns the estimator shell and its independently stateful child components.
   *
   * Renders the section landmark (landed via `aria-labelledby` against the
   * title) so the estimator is a single navigable region for assistive tech,
   * then composes the three child elements in flow order: type choices, stage
   * choices, and the calculated result. The children render and update on their
   * own after this shell mounts; this method only establishes the static
   * container and copy.
   */
  render(): string {
    const content = pricingContent.estimator;

    return HTML`
      <section id="pricing-estimate" class="pricing-estimator-section layout-page layout-section" aria-labelledby="pricing-estimate-title">
        <div class="pricing-section-copy">
          <p class="pricing-eyebrow">${content.eyebrow}</p>
          <h2 id="pricing-estimate-title" class="pricing-section-title mt-3">${content.title}</h2>
          <p class="pricing-section-lede mt-4">${content.body}</p>
        </div>

        <div class="pricing-estimator-flow">
          <pricing-estimator-type-options></pricing-estimator-type-options>
          <pricing-estimator-stage-options></pricing-estimator-stage-options>
          <pricing-estimator-result></pricing-estimator-result>
        </div>
      </section>
    `;
  }
}
