import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designElementContent } from "@app/data/design-element-content.ts";

/**
 * Closes `/design/element` with the repo audit's behavior-first control guidance.
 *
 * It explains why navigation, selection, and local utility controls remain native even when
 * they share visual language with an action. The section is intentionally static; it records
 * the decision criteria that future component work should follow.
 *
 * Selector: `design-element-guidance`.
 */
@Component({ selector: "design-element-guidance", shadow: false })
export class DesignElementGuidanceComponent extends BaseElement {
  /** Creates the static guidance section; its examples and rules are authored in the page content model. */
  constructor() {
    super();
  }

  /** Renders the audit groups plus the event sequence that connects a feature action to its renderer. */
  render(): string {
    const { guidance } = designElementContent;
    return HTML`
      <section id="design-element-guidance" class="design-element-guidance layout-page layout-section-end" aria-labelledby="design-element-guidance-title">
        <div class="design-element-guidance__heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${guidance.eyebrow}</p>
          <h2 id="design-element-guidance-title" class="type-section">${guidance.title}</h2>
          <p class="type-lede">${guidance.lede}</p>
        </div>
        <div class="design-element-guidance__groups layout-grid-2">
          ${guidance.groups.map((group) => HTML`
            <article class="design-element-guidance__group">
              <h3 class="type-card-title">${group.label}</h3>
              <dl>
                <div>
                  <dt>${guidance.labels.use}</dt>
                  <dd>${group.use}</dd>
                </div>
                <div>
                  <dt>${guidance.labels.examples}</dt>
                  <dd>${group.examples}</dd>
                </div>
              </dl>
              <p class="design-element-guidance__rule">${group.rule}</p>
            </article>
          `).join("")}
        </div>
        <section class="design-element-guidance__lifecycle" aria-labelledby="design-element-guidance-lifecycle-title">
          <div class="design-element-guidance__lifecycle-intro layout-stack layout-stack-sm">
            <p class="type-eyebrow">${guidance.lifecycle.eyebrow}</p>
            <h3 id="design-element-guidance-lifecycle-title" class="type-subsection">${guidance.lifecycle.title}</h3>
            <p class="type-lede">${guidance.lifecycle.lede}</p>
          </div>
          <ol class="design-element-guidance__lifecycle-steps">
            ${guidance.lifecycle.steps.map((step) => HTML`<li>${step}</li>`).join("")}
          </ol>
        </section>
      </section>
    `;
  }
}
