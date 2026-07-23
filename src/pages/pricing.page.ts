import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { pricingContent } from "@app/data/pricing-content.ts";

@Route({ path: "/pricing" })
@Component({
  selector: "pricing-page",
  shadow: false,
})
export class PricingPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    return {
      title: pricingContent.seo.title,
      description: pricingContent.seo.description,
      keywords: [...pricingContent.seo.keywords],
      og: {
        title: pricingContent.seo.ogTitle,
        description: pricingContent.seo.ogDescription,
      },
    };
  }

  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="pricing-page-main">
        <pricing-hero></pricing-hero>
        <pricing-switch></pricing-switch>
        <build-offering></build-offering>
        <pricing-estimator></pricing-estimator>
        <build-pricing></build-pricing>
        <speaking-offering></speaking-offering>
        <speaking-pricing></speaking-pricing>
        <pricing-faq></pricing-faq>
        <pricing-contact></pricing-contact>
      </main>
      <pricing-sticky-contact></pricing-sticky-contact>
      <app-footer></app-footer>
    `;
  }
}
