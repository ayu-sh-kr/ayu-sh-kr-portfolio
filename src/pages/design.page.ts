import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";

/**
 * Internal design reference route at `/design`.
 *
 * The page composes live typography specimens from the same global token system
 * used by every public route. It is intentionally a route, rather than a static
 * document, so maintainers can verify the design grammar in the active font,
 * color theme, and responsive layout.
 */
@Route({ path: "/design" })
@Component({
  selector: "design-page",
  shadow: false,
})
export class DesignPage extends DotaPageElement {
  /** Creates the route shell; the composed sections own their visual reference content. */
  constructor() {
    super();
  }

  /** Supplies route metadata through Dota's page lifecycle. */
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

  /** Renders the shared chrome around the typography reference sections. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-page-main">
        <design-typography-overview></design-typography-overview>
        <design-typography-roles></design-typography-roles>
        <design-typography-guidance></design-typography-guidance>
      </main>
      <app-footer></app-footer>
    `;
  }
}
