import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designToastContent } from "@app/data/design-toast-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Routed toast API reference at `/design/toast`.
 *
 * The page composes static orientation, live production-API specimens, and implementation
 * guidance between the shared chrome. Its SEO comes from the page-owned toast content model.
 *
 * Selector: `design-toast-page`.
 */
@Route({ path: "/design/toast", ssr: true })
@Component({ selector: "design-toast-page", shadow: false })
export class DesignToastPage extends DotaPageElement {
  /** Creates the route shell; child sections own authored content and demos. */
  constructor() {
    super();
  }

  /** Supplies metadata for the toast design grammar route. */
  get seo(): SEO {
    return toSEO(designToastContent.seo);
  }

  /** Composes the live toast reference between the shared site chrome. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-toast-page-main">
        <design-toast-overview></design-toast-overview>
        <design-toast-showcase></design-toast-showcase>
        <design-toast-guidance></design-toast-guidance>
      </main>
      <app-footer></app-footer>
    `;
  }
}
