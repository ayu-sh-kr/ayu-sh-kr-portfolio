import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";

/**
 * Internal typography design reference route at `/design`.
 *
 * The page composes live specimens from the global typography and semantic
 * color systems, giving maintainers one route to verify the grammar public
 * pages inherit. SEO is supplied through the page lifecycle.
 */
@Route({ path: "/design/typography" })
@Component({
  selector: "design-typography-page",
  shadow: false,
})
export class DesignTypographyPage extends DotaPageElement {
  /** Creates the route shell; composed sections own their reference content. */
  constructor() {
    super();
  }

  /** Supplies metadata for the typography design grammar route. */
  get seo(): SEO {
    return {
      title: "Typography design grammar | ayush.dev",
      description: "A live reference for the portfolio typography system and its shared usage rules.",
      keywords: ["design system", "typography", "design grammar", "Dota Web"],
      og: {
        title: "Typography design grammar | ayush.dev",
        description: "Live specimens and usage rules for the portfolio typography system.",
      },
    };
  }

  /** Renders shared chrome around the typography reference sections. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-typography-page-main">
        <design-typography-overview></design-typography-overview>
        <design-typography-roles></design-typography-roles>
        <design-typography-guidance></design-typography-guidance>
      </main>
      <app-footer></app-footer>
    `;
  }
}
