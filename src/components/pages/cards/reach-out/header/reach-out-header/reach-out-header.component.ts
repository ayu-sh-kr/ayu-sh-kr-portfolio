import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";
import { reachOutContent } from "@app/data/reach-out-content.ts";

/**
 * Provides the shared application identity above the Reach Out conversation.
 *
 * The route composes this independently from the card deck so its page-wide
 * alignment and reusable brand mark do not become part of deck interaction.
 *
 * Selector: `reach-out-header`.
 */
@Component({ selector: "reach-out-header", shadow: false })
export class ReachOutHeaderComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders the page-aligned brand and a direct path into the pricing project flow. */
  render(): string {
    return HTML`
      <header class="reach-out-header layout-page">
        <app-brand></app-brand>
        <a class="app-link app-link--nav reach-out-header__project-link" href="/pricing#pricing-start-project">${pricingContent.startProject.eyebrow}</a>
      </header>
    `;
  }
}
