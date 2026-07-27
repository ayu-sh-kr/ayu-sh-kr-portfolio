import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Composes the pricing estimator's two selectors and calculated result.
 *
 * The child option components publish typed selection events, while the result
 * component consumes them and owns the estimate state. This shell owns only the
 * estimator section layout and introductory copy.
 *
 * Selector: `pricing-estimator`.
 */
@Component({
  selector: "pricing-estimator",
  shadow: false,
})
export class PricingEstimatorComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Returns the estimator shell and its independently stateful child components. */
  render(): string {
    const content = pricingContent.estimator;

    return HTML`
      <section id="pricing-estimate" class="pricing-estimator-section" aria-labelledby="pricing-estimate-title">
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
