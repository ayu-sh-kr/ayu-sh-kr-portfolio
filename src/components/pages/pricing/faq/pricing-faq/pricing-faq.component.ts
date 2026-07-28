import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Renders the pricing FAQ list with Dota accordion elements.
 *
 * Questions and answers come from `pricingContent.faq`; the shared accordion
 * component owns expansion behavior, so this component only supplies content
 * and the pricing-specific configuration.
 *
 * Selector: `pricing-faq`.
 */
@Component({
  selector: "pricing-faq",
  shadow: false,
})
export class PricingFaqComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Returns the configured FAQ accordions from the authored pricing questions. */
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
        <div class="pricing-faq-content">
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
        </div>
      </section>
    `;
  }
}
