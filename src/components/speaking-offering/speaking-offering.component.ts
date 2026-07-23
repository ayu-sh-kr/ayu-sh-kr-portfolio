import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

@Component({
  selector: "speaking-offering",
  shadow: false,
})
export class SpeakingOfferingComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const content = pricingContent.speakingOffering;

    return HTML`
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
                (format) => `
                  <article class="speaking-format">
                    <h3>${format.title}</h3>
                    <p>${format.body}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
          <div class="speaking-topic-list" aria-label="${content.topicsAriaLabel}">
            ${content.topics.map((topic) => `<span>${topic}</span>`).join("")}
          </div>
        </div>
      </section>
    `;
  }
}
