import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designColorContent } from "@app/data/design-color-content.ts";

/**
 * Shows the semantic color roles available to all pages.
 *
 * The `/design/color` route renders the authored catalog from
 * `designColorContent`; component styles receive color only through the role
 * variables represented by those entries.
 */
@Component({
  selector: "design-color-roles",
  shadow: false,
})
export class DesignColorRolesComponent extends BaseElement {
  /** Creates the static color-role element. */
  constructor() {
    super();
  }

  /** Renders the complete semantic role inventory. */
  render(): string {
    const { roles } = designColorContent;

    return HTML`
      <section id="design-color-roles" class="design-color-roles design-section" aria-labelledby="design-color-roles-title">
        <div class="design-color-section-intro">
          <p class="type-eyebrow design-eyebrow">${roles.eyebrow}</p>
          <h2 id="design-color-roles-title" class="type-section-heading design-section-heading">${roles.title}</h2>
          <p class="type-body design-color-section-copy">${roles.lede}</p>
        </div>

        <div class="design-color-role-grid">
          ${roles.groups.map((group) => HTML`
            <article class="design-color-role-group" aria-labelledby="design-color-role-${group.name.toLowerCase()}">
              <h3 id="design-color-role-${group.name.toLowerCase()}" class="type-card-title design-color-role-title">${group.name}</h3>
              <p class="type-compact design-color-role-description">${group.description}</p>
              <ul class="design-color-role-list">
                ${group.roles.map((role) => HTML`
                  <li>
                    <span class="design-color-role-swatch" style="--design-swatch: var(${role.token});"></span>
                    <span class="design-color-role-label">${role.label}</span>
                    <code>${role.token}</code>
                  </li>
                `).join("")}
              </ul>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }
}
