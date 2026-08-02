import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designContent } from "@app/data/design-content.ts";

/**
 * Opening orientation for the `/design` grammar index.
 *
 * The route uses this as its only display-tier heading. It reads the shared
 * content model so its fixed grammar facts remain consistent with the doors
 * and ownership guidance that follow.
 *
 * Selector: `design-index-hero`.
 */
@Component({ selector: "design-index-hero", shadow: false })
export class DesignIndexHeroComponent extends BaseElement {
  /** Creates the static design-index introduction. */
  constructor() {
    super();
  }

  /** Renders the index title, context, and verifiable summary facts. */
  render(): string {
    const { hero } = designContent;

    return HTML`
      <section class="design-index-hero layout-page layout-section-hero" aria-labelledby="design-index-title">
        <div class="design-index-hero__copy layout-stack layout-stack-lg">
          <div class="layout-stack layout-stack-sm">
            <p class="type-eyebrow">${hero.eyebrow}</p>
            <h1 id="design-index-title" class="type-display">${hero.title.opening} <span>${hero.title.accent}</span> ${hero.title.closing}</h1>
            <p class="type-lede">${hero.lede}</p>
          </div>
          <ul class="design-index-hero__facts" aria-label="${hero.factsAriaLabel}">
            ${hero.facts.map((fact) => HTML`<li>${fact}</li>`).join("")}
          </ul>
        </div>
      </section>
    `;
  }
}
