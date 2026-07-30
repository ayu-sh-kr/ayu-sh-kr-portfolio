import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designButtonContent } from "@app/data/design-button-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Routed action-button reference at `/design/button`.
 *
 * It composes the static contract, live production-component specimens, and audit-backed
 * guidance that distinguishes async work from navigation, choice, and utility controls. SEO
 * is derived from `designButtonContent`, while the showcase registers its own temporary demo
 * handlers only for the lifetime of this route.
 */
@Route({ path: "/design/button" })
@Component({ selector: "design-button-page", shadow: false })
export class DesignButtonPage extends DotaPageElement {
  /** Creates the route shell; child sections own authored copy, demo handlers, and their teardown. */
  constructor() {
    super();
  }

  /** Converts the page-owned SEO model for Dota's route metadata hook whenever this route becomes active. */
  get seo(): SEO {
    return toSEO(designButtonContent.seo);
  }

  /** Composes the three documentation surfaces between shared chrome without duplicating their data or interactions. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-button-page-main">
        <design-button-overview></design-button-overview>
        <design-button-showcase></design-button-showcase>
        <design-button-guidance></design-button-guidance>
      </main>
      <app-footer></app-footer>
    `;
  }
}
