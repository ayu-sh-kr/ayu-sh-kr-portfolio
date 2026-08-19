import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Live interaction grammar route at `/design/interaction`.
 *
 * The page composes independent route sections between shared chrome. Each
 * section owns one trigger family or contract, keeping its live specimen and
 * implementation guidance together as the reference expands.
 */
@Route({ path: "/design/interaction", ssr: true })
@Component({ selector: "design-interaction-page", shadow: false })
export class DesignInteractionPage extends DotaPageElement {
  /** Creates the route shell; each composed section owns its temporary demo state. */
  constructor() {
    super();
  }

  /** Supplies metadata for the interaction grammar route through the normal page lifecycle. */
  get seo(): SEO {
    return toSEO(designInteractionContent.seo);
  }

  /** Renders the interaction reference in the same trigger order used by its route navigation. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="design-interaction-page-main">
        <design-interaction-hero></design-interaction-hero>
        <design-interaction-nav></design-interaction-nav>
        <design-interaction-pointer></design-interaction-pointer>
        <design-interaction-focus></design-interaction-focus>
        <design-interaction-scroll></design-interaction-scroll>
        <design-interaction-selection></design-interaction-selection>
        <design-interaction-ingest></design-interaction-ingest>
        <design-interaction-action></design-interaction-action>
        <design-interaction-recompute></design-interaction-recompute>
        <design-interaction-transient></design-interaction-transient>
        <design-interaction-interrupt></design-interaction-interrupt>
        <design-interaction-timing></design-interaction-timing>
        <design-interaction-verbs></design-interaction-verbs>
        <design-interaction-compound></design-interaction-compound>
        <design-interaction-reduced></design-interaction-reduced>
        <design-interaction-guardrails></design-interaction-guardrails>
        <design-interaction-checklist></design-interaction-checklist>
        <design-interaction-icon-usage></design-interaction-icon-usage>
      </main>
      <app-footer></app-footer>
    `;
  }
}
