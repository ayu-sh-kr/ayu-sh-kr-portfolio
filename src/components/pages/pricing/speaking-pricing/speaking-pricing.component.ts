import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Renders speaking-service pricing tiers and their contact CTAs.
 *
 * The tier formatter mirrors the build pricing boundary while reading its own
 * `pricingContent.speakingPricing` data, keeping the two offers independent as
 * their copy and visual treatment evolve.
 *
 * Selector: `speaking-pricing`.
 */
@Component({
  selector: "speaking-pricing",
  shadow: false,
})
export class SpeakingPricingComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Returns the speaking pricing heading and all authored pricing tiers. */
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

  /** Formats one speaking tier with its featured marker, bullets, and CTA. */
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
