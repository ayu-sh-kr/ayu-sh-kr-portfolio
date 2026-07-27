import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

@Component({
  selector: "build-pricing",
  shadow: false,
})
export class BuildPricingComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const content = pricingContent.buildPricing;

    return HTML`
      <section class="build-pricing-section" aria-labelledby="build-pricing-title">
        <div class="build-pricing-copy">
          <p class="pricing-eyebrow">${content.eyebrow}</p>
          <h2 id="build-pricing-title" class="pricing-section-title mt-3">${content.title}</h2>
          <p class="pricing-section-lede mt-4">${content.body}</p>
        </div>
        <div class="build-pricing-grid">
          ${content.tiers.map((tier) => this.renderTier(tier, content.featuredLabel)).join("")}
        </div>
        <p class="build-pricing-note">${content.note} <a href="#pricing-contact">${content.noteLink}</a>.</p>
      </section>
    `;
  }

  private renderTier(tier: (typeof pricingContent.buildPricing.tiers)[number], featuredLabel: string): string {
    return `
      <article class="build-pricing-tier ${tier.featured ? "is-featured" : ""}">
        ${tier.featured ? `<span class="build-pricing-flag">${featuredLabel}</span>` : ""}
        <p class="pricing-eyebrow">${tier.name}</p>
        <p class="build-pricing-price">${tier.price}<small>${tier.suffix}</small></p>
        <p class="build-pricing-summary">${tier.summary}</p>
        <ul>
          ${tier.bullets
            .map(
              (bullet) => `<li><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3 3 7-8" /></svg>${bullet}</li>`,
            )
            .join("")}
        </ul>
        <a class="${tier.featured ? "build-pricing-accent-button" : "build-pricing-ghost-button"}" href="#pricing-contact">${tier.cta}</a>
      </article>
    `;
  }
}
