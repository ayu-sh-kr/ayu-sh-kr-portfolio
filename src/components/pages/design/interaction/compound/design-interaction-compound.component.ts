import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Explains how independently governed interactions form one intentional product sequence. */
@Component({ selector: "design-interaction-compound", shadow: false })
export class DesignInteractionCompoundComponent extends BaseElement {
  /** Creates the static composition rule. */
  constructor() {
    super();
  }

  /** Renders the three hand-offs that form the sanctioned feedback composition. */
  render(): TemplateResult {
    const { compound } = designInteractionContent;

    return html` <section
      id="compound"
      class="design-interaction-section layout-page layout-section"
      aria-labelledby="compound-title"
    >
      <header class="design-interaction-heading layout-stack layout-stack-sm">
        <p class="type-eyebrow">${compound.eyebrow}</p>
        <h2 id="compound-title" class="type-section">${compound.title}</h2>
        <p class="type-lede">${compound.lede}</p>
      </header>
      <ol class="design-interaction-sequence">
        ${compound.steps.map((step) => html`<li>${step}</li>`)}
      </ol>
    </section>`;
  }
}
