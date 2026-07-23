import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

@Component({
  selector: "build-offering",
  shadow: false,
})
export class BuildOfferingComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const content = pricingContent.buildOffering;

    return HTML`
      <section id="pricing-build" class="pricing-section pricing-build-section" aria-labelledby="pricing-build-title">
        <div class="pricing-section-copy">
          <p class="pricing-eyebrow">${content.eyebrow}</p>
          <h2 id="pricing-build-title" class="pricing-section-title mt-3">${content.title}</h2>
          <p class="pricing-section-lede mt-5">${content.body}</p>
        </div>
        <div class="pricing-value-grid">
          ${content.rows
            .map(
              (row) => `
                <article class="pricing-value-row">
                  <span class="pricing-value-number">${row.number}</span>
                  <div>
                    <h3>${row.title}</h3>
                    <p>${row.body}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }
}
