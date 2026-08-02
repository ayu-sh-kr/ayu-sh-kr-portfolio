import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designToastContent } from "@app/data/design-toast-content.ts";

/**
 * Closing implementation guidance for the `/design/toast` reference route.
 *
 * The component maps page-owned rules into a sticky reading rail after visitors have exercised
 * the live API, keeping policy copy separate from the host's runtime behavior.
 *
 * Selector: `design-toast-guidance`.
 */
@Component({ selector: "design-toast-guidance", shadow: false })
export class DesignToastGuidanceComponent extends BaseElement {
  /** Creates the static guidance section after the live specimen controls. */
  constructor() {
    super();
  }

  /** Renders the implementation guidance after the live Toast specimens. */
  render(): string {
    const { guidance } = designToastContent;
    return HTML`
      <section id="design-toast-guidance" class="design-toast-guidance layout-page layout-section-end layout-grid-rail" aria-labelledby="design-toast-guidance-title">
        <div class="layout-stack layout-stack-sm">
          <p class="type-eyebrow">${guidance.eyebrow}</p>
          <h2 id="design-toast-guidance-title" class="type-section">${guidance.title}</h2>
        </div>
        <ol class="design-toast-guidance__list layout-rail">
          ${guidance.rules.map((rule, index) => HTML`<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3 class="type-card-title">${rule.label}</h3><p>${rule.body}</p></div></li>`).join("")}
        </ol>
      </section>
    `;
  }
}
