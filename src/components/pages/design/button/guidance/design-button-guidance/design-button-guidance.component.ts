import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designButtonContent } from "@app/data/design-button-content.ts";

/**
 * Closes `/design/button` with the repo audit's behavior-first control guidance.
 *
 * It explains why navigation, selection, and local utility controls remain native even when
 * they share visual language with an action. The section is intentionally static; it records
 * the decision criteria that future component work should follow.
 *
 * Selector: `design-button-guidance`.
 */
@Component({ selector: "design-button-guidance", shadow: false })
export class DesignButtonGuidanceComponent extends BaseElement {
  /** Creates the static guidance section; its examples and rules are authored in the page content model. */
  constructor() {
    super();
  }

  /** Renders the audit groups plus the event sequence that connects a feature action to its renderer. */
  render(): string {
    const { guidance } = designButtonContent;
    return HTML`
      <section class="design-button-guidance layout-page layout-section-end" aria-labelledby="design-button-guidance-title">
        <div class="design-button-guidance__heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${guidance.eyebrow}</p>
          <h2 id="design-button-guidance-title" class="type-section">${guidance.title}</h2>
          <p class="type-lede">${guidance.lede}</p>
        </div>
        <div class="design-button-guidance__groups layout-grid-2">
          ${guidance.groups.map((group) => HTML`
            <article class="design-button-guidance__group">
              <h3 class="type-card-title">${group.label}</h3>
              <p><strong>Use:</strong> ${group.use}</p>
              <p><strong>Examples:</strong> ${group.examples}</p>
              <p>${group.rule}</p>
            </article>
          `).join("")}
        </div>
        <div class="design-button-guidance__lifecycle layout-stack layout-stack-sm">
          <p class="type-eyebrow">Event path</p>
          <ol>
            ${guidance.lifecycle.map((step) => HTML`<li>${step}</li>`).join("")}
          </ol>
        </div>
      </section>
    `;
  }
}
