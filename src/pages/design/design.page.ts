import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designContent } from "@app/data/design-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Entry route for the portfolio's five live design grammars at `/design`.
 *
 * The page is a navigable index rather than a sixth grammar: its hero orients
 * maintainers, while the reference section maps each decision layer to the
 * existing implementation routes. Metadata comes from the route-owned content
 * model through Dota's normal page lifecycle.
 *
 * Selector: `design-page`.
 */
@Route({ path: "/design" })
@Component({ selector: "design-page", shadow: false })
export class DesignPage extends DotaPageElement {
  /** Creates the static route shell; child sections own the index presentation and scroll state. */
  constructor() {
    super();
  }

  /** Converts the authored index metadata into Dota route metadata whenever `/design` becomes active. */
  get seo(): SEO {
    return toSEO(designContent.seo);
  }

  /** Composes the design index between the shared header and footer without duplicating its content. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-page-main">
        <design-index-hero></design-index-hero>
        <design-index-reference></design-index-reference>
      </main>
      <app-footer></app-footer>
    `;
  }
}
