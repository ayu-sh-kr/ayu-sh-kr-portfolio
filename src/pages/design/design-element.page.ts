import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designElementContent } from "@app/data/design-element-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Routed design-element reference at `/design/element`.
 *
 * It composes the static contract, live production-component specimens, and audit-backed
 * guidance that distinguishes async work from navigation, choice, and utility controls. SEO
 * is derived from `designElementContent`, while the button showcase registers its own temporary demo
 * handlers only for the lifetime of this route.
 */
@Route({ path: "/design/element", ssr: true })
@Component({ selector: "design-element-page", shadow: false })
export class DesignElementPage extends DotaPageElement {
  /** Creates the route shell; child sections own authored copy, demo handlers, and their teardown. */
  constructor() {
    super();
  }

  /** Converts the page-owned SEO model for Dota's route metadata hook whenever this route becomes active. */
  get seo(): SEO {
    return toSEO(designElementContent.seo);
  }

  /** Composes the overview, button, anchor, and guidance surfaces between shared chrome without duplicating their data or interactions. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-element-page-main">
        <design-element-overview></design-element-overview>
        <design-button-showcase></design-button-showcase>
        <design-anchor-link-showcase></design-anchor-link-showcase>
        <design-element-guidance></design-element-guidance>
      </main>
      <app-footer></app-footer>
    `;
  }
}
