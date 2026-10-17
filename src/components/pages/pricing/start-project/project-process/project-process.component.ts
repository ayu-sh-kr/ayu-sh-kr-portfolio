import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Explains the four commitment points that follow a completed project brief.
 *
 * The pricing page places it directly after the adaptive intake. The component reads its
 * sequence from `pricingContent.startProject`, so copy and timing remain in the content layer
 * while this element owns only the subsection presentation.
 *
 * Selector: `pricing-project-process`.
 */
@Component({
  selector: "pricing-project-process",
  shadow: false,
})
export class PricingProjectProcessComponent extends BaseElement {
  /** Initialises the presentational process component. */
  constructor() {
    super();
  }

  /** Renders the process introduction and ordered project-start cards. */
  render(): TemplateResult {
    const content = pricingContent.startProject;

    return html`
      <section
        class="pricing-project-process-section layout-page"
        aria-labelledby="pricing-project-process-title"
      >
        <div class="pricing-project-subsection-copy">
          <p class="pricing-eyebrow">${content.processEyebrow}</p>
          <h3 id="pricing-project-process-title">${content.processTitle}</h3>
          <p>${content.processBody}</p>
        </div>
        <div class="pricing-project-process-grid">
          ${content.process.map(
            (step) =>
              html`<article>
                <span>${step.number}</span>
                <h4>${step.title}</h4>
                <p>${step.body}</p>
                <b>${step.when}</b>
              </article>`
          )}
        </div>
      </section>
    `;
  }
}
