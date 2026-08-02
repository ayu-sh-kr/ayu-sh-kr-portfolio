import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Ends the reference with the release checks required for every newly introduced behaviour. */
@Component({ selector: "design-interaction-checklist", shadow: false })
export class DesignInteractionChecklistComponent extends BaseElement {
  /** Creates the static ship checklist. */
  constructor() {
    super();
  }

  /** Renders the final implementation checks after every live specimen has been introduced. */
  render(): string {
    const { checklist } = designInteractionContent;

    return HTML`
      <section id="ship" class="design-interaction-section layout-page layout-section-end" aria-labelledby="ship-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${checklist.eyebrow}</p>
          <h2 id="ship-title" class="type-section">${checklist.title}</h2>
          <p class="type-lede">${checklist.lede}</p>
        </header>
        <ol class="design-interaction-checklist">
          ${checklist.items.map((item) => HTML`<li>${item}</li>`).join("")}
        </ol>
      </section>`;
  }
}
