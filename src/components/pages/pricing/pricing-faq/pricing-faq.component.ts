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
    const accordionConfig = JSON.stringify({
      container: "pricing-faq-accordion-container",
      button: {
        base: "pricing-faq-accordion-button",
        size: { md: "" },
        color: { gray: { ghost: "pricing-faq-accordion-button-color" } },
      },
      paragraph: "pricing-faq-accordion-answer",
    });

    return HTML`
      <section class="pricing-faq-section" aria-labelledby="pricing-faq-title">
        <p class="pricing-eyebrow">${content.eyebrow}</p>
        <h2 id="pricing-faq-title" class="pricing-section-title mt-3">${content.title}</h2>
        <div class="pricing-faq-list">
          ${content.items
            .map(
              (item) => HTML`
                <dota-accordion
                  classname="pricing-faq-accordion"
                  header="${item.question}"
                  description="${item.answer}"
                  config='${accordionConfig}'
                ></dota-accordion>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }
}
