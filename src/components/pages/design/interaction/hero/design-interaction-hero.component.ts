import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Introduces the interaction grammar before visitors enter its trigger-by-trigger reference. */
@Component({ selector: "design-interaction-hero", shadow: false })
export class DesignInteractionHeroComponent extends BaseElement {
  /** Creates the static route introduction. */
  constructor() {
    super();
  }

  /** Renders the design grammar headline, its reading measure, and reference summary. */
  render(): TemplateResult {
    const { hero } = designInteractionContent;

    return html`
      <section class="design-interaction-hero layout-page layout-section-hero" aria-labelledby="design-interaction-title">
        <div class="design-interaction-hero__copy layout-stack layout-stack-lg">
          <div class="layout-stack layout-stack-sm">
            <p class="type-eyebrow">${hero.eyebrow}</p>
            <h1 id="design-interaction-title" class="type-display">${hero.title.opening} <span>${hero.title.accent}</span> ${hero.title.closing}</h1>
            <p class="type-lede">${hero.lede}</p>
          </div>
          <ul class="design-interaction-tags" aria-label="${hero.tagsAriaLabel}">
            ${hero.tags.map((tag) => html`<li>${tag}</li>`)}
          </ul>
        </div>
      </section>`;
  }
}
