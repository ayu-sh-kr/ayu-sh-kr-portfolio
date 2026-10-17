import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Renders the speaking-services offering on the pricing page.
 *
 * Formats and topics are read from `pricingContent.speakingOffering`, leaving
 * the component as a pure composition of authored content and pricing markup.
 *
 * Selector: `speaking-offering`.
 */
@Component({
  selector: "speaking-offering",
  shadow: false,
})
export class SpeakingOfferingComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Returns speaking formats and topics from the pricing content source. */
  render(): TemplateResult {
    const content = pricingContent.speakingOffering;

    return html`
      <section id="pricing-speak" class="speaking-offering-section" aria-labelledby="speaking-offering-title">
        <div class="speaking-offering-inner">
          <div class="speaking-offering-copy">
            <p class="pricing-eyebrow">${content.eyebrow}</p>
            <h2 id="speaking-offering-title" class="pricing-section-title mt-3">${content.title}</h2>
            <p class="pricing-section-lede mt-5">${content.body}</p>
          </div>
          <div class="speaking-format-grid">
            ${content.formats
              .map(
                (format) => html`
                  <article class="speaking-format">
                    <h3>${format.title}</h3>
                    <p>${format.body}</p>
                  </article>
                `,
              )}
          </div>
          <div class="speaking-topic-list" aria-label="${content.topicsAriaLabel}">
            ${content.topics.map((topic) => html`<span>${topic}</span>`)}
          </div>
        </div>
      </section>
    `;
  }
}
