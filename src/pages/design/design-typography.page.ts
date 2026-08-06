import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designTypographyContent } from "@app/data/design-typography-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Internal typography design reference route at `/design`.
 *
 * The page composes live specimens from the global typography and semantic
 * color systems, giving maintainers one route to verify the grammar public
 * pages inherit. SEO is supplied through the page lifecycle.
 */
@Route({ path: "/design/typography", ssr: true })
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
    return toSEO(designTypographyContent.seo);
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
