import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

@Component({
  selector: "pricing-faq",
  shadow: false,
})
export class PricingFaqComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const content = pricingContent.faq;

    return HTML`
      <section class="pricing-faq-section" aria-labelledby="pricing-faq-title">
        <p class="pricing-eyebrow">${content.eyebrow}</p>
        <h2 id="pricing-faq-title" class="pricing-section-title mt-3">${content.title}</h2>
        <div class="pricing-faq-list">
          ${content.items
            .map(
              (item) => `
                <details class="pricing-faq-item">
                  <summary>${item.question}<span aria-hidden="true">+</span></summary>
                  <p>${item.answer}</p>
                </details>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }
}
