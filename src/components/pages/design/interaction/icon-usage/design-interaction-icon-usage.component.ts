import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/**
 * Documents the approved identity marks used by the interaction reference.
 *
 * The design route composes this section after the interaction checklist. Its
 * authored examples come from `designInteractionContent`, so adding an asset
 * means extending that data rather than changing the rendering contract.
 *
 * Selector: `design-interaction-icon-usage`.
 */
@Component({ selector: "design-interaction-icon-usage", shadow: false })
export class DesignInteractionIconUsageComponent extends BaseElement {
  constructor() {
    super();
  }

  /**
   * Renders the icon examples from the interaction content model.
   *
   * Each example remains data-owned so the design page can add or revise an
   * approved asset without duplicating markup or changing section composition.
   */
  render(): string {
    const { iconUsage } = designInteractionContent;

    return HTML`
      <section id="icons" class="design-interaction-section design-interaction-icon-usage layout-page layout-section" aria-labelledby="icons-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${iconUsage.eyebrow}</p>
          <h2 id="icons-title" class="type-section">${iconUsage.title}</h2>
          <p class="type-lede">${iconUsage.lede}</p>
        </header>
        <div class="design-interaction-icon-grid layout-grid-auto">
          ${iconUsage.examples.map((example) => HTML`
            <figure class="design-interaction-icon-card">
              <div class="design-interaction-icon-stage">
                <img src="${example.path}" alt="" aria-hidden="true" />
              </div>
              <figcaption>
                <strong>${example.label}</strong>
                <span>${example.note}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </section>
    `;
  }
}
