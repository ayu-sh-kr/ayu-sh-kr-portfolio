import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Renders the pricing page's contact call to action and trust links.
 *
 * Email, call, GitHub, and LinkedIn destinations are authored in
 * `pricingContent.contact`, keeping this component focused on presentation.
 *
 * Selector: `pricing-contact`.
 */
@Component({
  selector: "pricing-contact",
  shadow: false,
})
export class PricingContactComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Returns the contact section using the pricing contact content and destinations. */
  render(): string {
    const content = pricingContent.contact;

    return HTML`
      <section id="pricing-contact" class="pricing-contact-section" aria-labelledby="pricing-contact-title">
        <div class="pricing-contact-inner">
          <p class="pricing-eyebrow">${content.eyebrow}</p>
          <h2 id="pricing-contact-title" class="pricing-contact-title mt-4">${content.titleBeforeAccent} <span>${content.titleAccent}</span></h2>
          <p class="pricing-contact-copy mt-6">${content.body}</p>
          <div class="pricing-contact-actions mt-10">
            <a class="pricing-contact-accent-button" href="${content.emailHref}">${content.emailLabel}</a>
            <a class="pricing-contact-ghost-button" href="${content.callHref}">${content.callLabel}</a>
          </div>
          <p class="pricing-contact-trust mt-8">${content.trust} · <a href="${content.githubHref}" target="_blank" rel="noreferrer">${content.githubLabel}</a> · <a href="${content.linkedinHref}" target="_blank" rel="noreferrer">${content.linkedinLabel}</a> · ${content.timezone}</p>
        </div>
      </section>
    `;
  }
}
