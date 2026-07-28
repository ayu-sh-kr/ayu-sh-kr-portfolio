import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designLayoutContent } from "@app/data/design-layout-content.ts";

/** Explains how route sections and narrower inner measures work together. */
@Component({
  selector: "design-layout-guidance",
  shadow: false,
})
export class DesignLayoutGuidanceComponent extends BaseElement {
  /** Creates the static implementation-guidance element. */
  constructor() {
    super();
  }

  /** Renders the implementation rules for shared page geometry. */
  render(): string {
    const { guidance } = designLayoutContent;

    return HTML`
      <section class="design-layout-guidance layout-page" aria-labelledby="design-layout-guidance-title">
        <div>
          <p class="type-eyebrow">${guidance.eyebrow}</p>
          <h2 id="design-layout-guidance-title" class="type-section">${guidance.title}</h2>
          <p class="type-lede">${guidance.lede}</p>
        </div>
        <ol class="design-layout-rules">
          ${guidance.rules.map((rule, index) => HTML`<li><span>${String(index + 1).padStart(2, "0")}</span><p>${rule}</p></li>`).join("")}
        </ol>
      </section>
    `;
  }
}
