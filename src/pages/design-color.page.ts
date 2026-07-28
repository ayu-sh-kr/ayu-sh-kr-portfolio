import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designColorContent } from "@app/data/design-color-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Internal design reference route for the application's color grammar.
 *
 * The page renders the active semantic tokens instead of a copied palette, so
 * it remains a reliable visual check for the colors every public route uses.
 */
@Route({ path: "/design/color" })
@Component({
  selector: "design-color-page",
  shadow: false,
})
export class DesignColorPage extends DotaPageElement {
  /** Creates the route shell; composed sections own the reference content. */
  constructor() {
    super();
  }

  /** Supplies metadata for the color design grammar route. */
  get seo(): SEO {
    return toSEO(designColorContent.seo);
  }

  /** Renders shared chrome around the color reference sections. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-color-page-main">
        <design-color-overview></design-color-overview>
        <design-color-roles></design-color-roles>
        <design-color-guidance></design-color-guidance>
      </main>
      <app-footer></app-footer>
    `;
  }
}
