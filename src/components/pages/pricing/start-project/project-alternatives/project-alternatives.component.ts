import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/**
 * Offers relevant next steps to visitors who are not ready to submit a project brief.
 *
 * This completes the start-project flow with links to the in-page estimator, showcase
 * route, and existing-client support route. Destinations are authored alongside the
 * rest of the pricing content so route changes have one source of truth.
 *
 * Selector: `pricing-project-alternatives`.
 */
@Component({
  selector: "pricing-project-alternatives",
  shadow: false,
})
export class PricingProjectAlternativesComponent extends BaseElement {
  /** Initialises the presentational alternatives component. */
  constructor() {
    super();
  }

  /** Renders the authored alternative links after the project-start process. */
  render(): string {
    const content = pricingContent.startProject;

    return HTML`
      <section class="pricing-project-alternatives-section layout-page" aria-labelledby="pricing-project-alternatives-title">
        <div class="pricing-project-subsection-copy">
          <p class="pricing-eyebrow">${content.alternativesEyebrow}</p>
          <h3 id="pricing-project-alternatives-title">${content.alternativesTitle}</h3>
        </div>
        <div class="pricing-project-alternatives-grid">
          ${content.alternatives.map((item) => `<a href="${escapeHtml(item.href)}"><strong>${escapeHtml(item.title)} <span aria-hidden="true">→</span></strong><small>${escapeHtml(item.body)}</small></a>`).join("")}
        </div>
      </section>
    `;
  }
}
