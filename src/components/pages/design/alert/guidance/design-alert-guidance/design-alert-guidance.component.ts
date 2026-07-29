import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designAlertContent } from "@app/data/design-alert-content.ts";

/** Captures the practical constraints that keep blocking alerts proportionate. */
@Component({
  selector: "design-alert-guidance",
  shadow: false,
})
export class DesignAlertGuidanceComponent extends BaseElement {
  /** Creates the static usage-guidance element. */
  constructor() {
    super();
  }

  /** Renders the alert API guidance after visitors have tried the live specimens. */
  render(): string {
    const { guidance } = designAlertContent;

    return HTML`
      <section class="design-alert-guidance layout-page layout-section-end layout-grid-rail" aria-labelledby="design-alert-guidance-title">
        <div class="layout-stack layout-stack-sm">
          <p class="type-eyebrow">${guidance.eyebrow}</p>
          <h2 id="design-alert-guidance-title" class="type-section">${guidance.title}</h2>
        </div>
        <ol class="design-alert-guidance-list layout-rail">
          ${guidance.rules.map((rule, index) => HTML`<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3 class="type-card-title">${rule.label}</h3><p>${rule.body}</p></div></li>`).join("")}
        </ol>
      </section>
    `;
  }
}
