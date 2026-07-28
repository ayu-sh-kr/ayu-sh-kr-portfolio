import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * One-time coffee support route at `/coffee`.
 *
 * The page keeps the conversion path deliberately short: the hero introduces
 * the purpose, `coffee-order` owns the interactive order state, and the
 * remaining sections provide quiet context before returning to that order.
 * SEO comes from the authored content module and is applied by `DotaPageElement`
 * during route initialization.
 */
@Route({ path: "/coffee" })
@Component({
  selector: "coffee-page",
  shadow: false,
})
export class CoffeePage extends DotaPageElement {
  /** Creates the route shell; each child component owns its presentation or interaction. */
  constructor() {
    super();
  }

  /** Adapts the coffee route metadata to the framework SEO contract. */
  get seo(): SEO {
    return toSEO(coffeeContent.seo);
  }

  /** Renders the support journey in the order a visitor encounters it. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="coffee-page-main">
        <coffee-hero></coffee-hero>
        <coffee-order></coffee-order>
        <coffee-impact></coffee-impact>
        <coffee-supporters></coffee-supporters>
        <coffee-closing></coffee-closing>
      </main>
      <coffee-sticky></coffee-sticky>
      <app-footer></app-footer>
    `;
  }
}
