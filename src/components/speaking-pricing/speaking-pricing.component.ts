import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

@Component({
  selector: "speaking-pricing",
  shadow: false,
})
export class SpeakingPricingComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const content = pricingContent.speakingPricing;

    return HTML`
      <section class="speaking-pricing-section" aria-labelledby="speaking-pricing-title">
        <div class="speaking-pricing-copy">
          <p class="pricing-eyebrow">${content.eyebrow}</p>
          <h2 id="speaking-pricing-title" class="pricing-section-title mt-3">${content.title}</h2>
          <p class="pricing-section-lede mt-4">${content.body}</p>
        </div>
        <div class="speaking-pricing-grid">
          ${content.tiers.map((tier) => this.renderTier(tier, content.featuredLabel)).join("")}
        </div>
      </section>
    `;
  }

  private renderTier(tier: (typeof pricingContent.speakingPricing.tiers)[number], featuredLabel: string): string {
    return `
      <article class="speaking-pricing-tier ${tier.featured ? "is-featured" : ""}">
        ${tier.featured ? `<span class="speaking-pricing-flag">${featuredLabel}</span>` : ""}
        <p class="pricing-eyebrow">${tier.name}</p>
        <p class="speaking-pricing-price">${tier.price}<small>${tier.suffix}</small></p>
        <p class="speaking-pricing-summary">${tier.summary}</p>
        <ul>
          ${tier.bullets
            .map(
              (bullet) => `<li><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3 3 7-8" /></svg>${bullet}</li>`,
            )
            .join("")}
        </ul>
        <a class="${tier.featured ? "speaking-pricing-accent-button" : "speaking-pricing-ghost-button"}" href="#pricing-contact">${tier.cta}</a>
      </article>
    `;
  }
}
