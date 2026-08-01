import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designAlertContent } from "@app/data/design-alert-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Live alert API reference at `/design/alert`.
 *
 * The route keeps alert examples out of product flows while exercising the same
 * singleton dialog that application handlers import through {@link Alert}.
 */
@Route({ path: "/design/alert" })
@Component({
  selector: "design-alert-page",
  shadow: false,
})
export class DesignAlertPage extends DotaPageElement {
  /** Creates the route shell; its sections own authored specimens and interaction. */
  constructor() {
    super();
  }

  /** Supplies the design-reference metadata through the normal page lifecycle. */
  get seo(): SEO {
    return toSEO(designAlertContent.seo);
  }

  /** Composes the alert reference sections between shared site chrome. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-alert-page-main">
        <design-alert-overview></design-alert-overview>
        <design-alert-showcase></design-alert-showcase>
        <design-alert-guidance></design-alert-guidance>
      </main>
      <app-footer></app-footer>
    `;
  }
}
