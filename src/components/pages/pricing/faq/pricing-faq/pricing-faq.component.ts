import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { DOTA_FAQ_ACCORDION_CLASS, DOTA_FAQ_ACCORDION_CONFIG } from "@app/components/utils/faq/dota-faq-accordion.ts";
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

    return HTML`
      <section class="pricing-faq-section layout-page" aria-labelledby="pricing-faq-title">
        <div class="pricing-faq-content">
          <p class="pricing-eyebrow">${content.eyebrow}</p>
          <h2 id="pricing-faq-title" class="pricing-section-title mt-3">${content.title}</h2>
          <div class="pricing-faq-list">
            ${content.items
              .map(
                (item) => HTML`
                  <dota-accordion
                    classname="${DOTA_FAQ_ACCORDION_CLASS}"
                    header="${item.question}"
                    description="${item.answer}"
                    config='${DOTA_FAQ_ACCORDION_CONFIG}'
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
