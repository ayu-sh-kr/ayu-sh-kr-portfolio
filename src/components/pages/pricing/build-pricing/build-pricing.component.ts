import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Renders the build-services pricing tiers and their conversion links.
 *
 * Tier data lives in `pricingContent.buildPricing`; the list renderer delegates
 * each card to a small pure formatter so featured styling and bullet mapping stay
 * local to the build-pricing surface.
 *
 * Selector: `build-pricing`.
 */
@Component({
  selector: "build-pricing",
  shadow: false,
})
export class BuildPricingComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Returns the build pricing heading, tiers, and note from authored content. */
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

  /** Formats one build tier, including its featured marker, bullets, and CTA. */
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
