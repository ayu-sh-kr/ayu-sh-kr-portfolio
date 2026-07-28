import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designLayoutContent } from "@app/data/design-layout-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Live layout-system reference route at `/design/layout`.
 *
 * It documents the geometry consumed by route sections so maintainers can
 * verify shared alignment without inspecting each page independently.
 */
@Route({ path: "/design/layout" })
@Component({
  selector: "design-layout-page",
  shadow: false,
})
export class DesignLayoutPage extends DotaPageElement {
  /** Creates the route shell; composed sections own their reference content. */
  constructor() {
    super();
  }

  /** Supplies metadata for the layout design grammar route. */
  get seo(): SEO {
    return toSEO(designLayoutContent.seo);
  }

  /** Renders shared chrome around the layout reference sections. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-layout-page-main">
        <design-layout-overview></design-layout-overview>
        <design-layout-roles></design-layout-roles>
        <design-layout-guidance></design-layout-guidance>
      </main>
      <app-footer></app-footer>
    `;
  }
}
