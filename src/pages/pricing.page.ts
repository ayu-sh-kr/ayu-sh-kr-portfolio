import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { pricingContent } from "@app/data/pricing-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Pricing route at `/pricing`.
 *
 * The page composes engagement sections and adapts `pricingContent.seo` to the
 * framework contract, keeping commercial copy in the data layer.
 */
@Route({ path: "/pricing" })
@Component({
  selector: "pricing-page",
  shadow: false,
})
export class PricingPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Returns pricing SEO authored in `pricingContent.seo`. */
  get seo(): SEO {
    return toSEO(pricingContent.seo);
  }

  /** Renders the pricing sections in their reader-facing order. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="pricing-page-main">
        <pricing-hero></pricing-hero>
        <pricing-switch></pricing-switch>
        <build-offering></build-offering>
        <pricing-estimator data-analytics-section="pricing_estimator"></pricing-estimator>
        <build-pricing></build-pricing>
        <speaking-offering></speaking-offering>
        <speaking-pricing></speaking-pricing>
        <pricing-faq></pricing-faq>
        <pricing-contact data-analytics-section="pricing_contact"></pricing-contact>
      </main>
      <pricing-sticky-contact></pricing-sticky-contact>
      <app-footer></app-footer>
    `;
  }
}
