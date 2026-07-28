import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";

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
    return {
      title: "Color design grammar | ayush.dev",
      description: "A live reference for the portfolio color system and its shared usage rules.",
      keywords: ["design system", "color", "design grammar", "Dota Web"],
      og: {
        title: "Color design grammar | ayush.dev",
        description: "Live color roles and usage rules for the portfolio theme.",
      },
    };
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
