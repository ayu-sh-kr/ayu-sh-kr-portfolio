import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Captures the prohibited patterns that most often create interaction drift between routes. */
@Component({ selector: "design-interaction-guardrails", shadow: false })
export class DesignInteractionGuardrailsComponent extends BaseElement {
  /** Creates the static boundary list. */
  constructor() {
    super();
  }

  /** Renders the explicit constraints that preserve the grammar's small, maintainable vocabulary. */
  render(): string {
    const { guardrails } = designInteractionContent;

    return HTML`
      <section id="never" class="design-interaction-section layout-page layout-section" aria-labelledby="never-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${guardrails.eyebrow}</p>
          <h2 id="never-title" class="type-section">${guardrails.title}</h2>
          <p class="type-lede">${guardrails.lede}</p>
        </header>
        <ul class="design-interaction-never">
          <li>${guardrails.firstItem.before}<code>${guardrails.firstItem.code}</code>${guardrails.firstItem.after}</li>
          ${guardrails.items.map((item) => HTML`<li>${item}</li>`).join("")}
        </ul>
      </section>`;
  }
}
