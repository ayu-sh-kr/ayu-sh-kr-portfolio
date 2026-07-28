import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designLayoutContent } from "@app/data/design-layout-content.ts";

/** Renders the available shared layout measures. */
@Component({
  selector: "design-layout-roles",
  shadow: false,
})
export class DesignLayoutRolesComponent extends BaseElement {
  /** Creates the static layout-role element. */
  constructor() {
    super();
  }

  /** Renders each layout token with its intended content role. */
  render(): string {
    const { roles } = designLayoutContent;

    return HTML`
      <section class="design-layout-roles layout-page layout-section" aria-labelledby="design-layout-roles-title">
        <div class="design-layout-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${roles.eyebrow}</p>
          <h2 id="design-layout-roles-title" class="type-section">${roles.title}</h2>
          <p class="type-lede">${roles.lede}</p>
        </div>
        <div class="design-layout-role-grid layout-grid-4">
          ${roles.items.map((item) => HTML`
            <article class="design-layout-role-card">
              <code>${item.token}</code>
              <p class="type-label">${item.title}</p>
              <strong>${item.value}</strong>
              <p>${item.description}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }
}
