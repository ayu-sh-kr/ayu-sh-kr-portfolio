import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designTypographyContent } from "@app/data/design-typography-content.ts";

/** Applies the presentation role that corresponds to each authored specimen card. */
const ROLE_CARD_CLASSES = ["display", "section", "subsection", "lede", "body", "compact", "card", "eyebrow", "label", "control", "metric"] as const;

/**
 * Renders live specimens for each shared typography role.
 *
 * The `/design` route uses this component as the practical reference for code
 * authors. Its data-driven cards keep a role's token, intended context, and
 * visual output together, so expanding the shared scale requires one update.
 */
@Component({
  selector: "design-typography-roles",
  shadow: false,
})
export class DesignTypographyRolesComponent extends BaseElement {
  /** Creates the static specimen collection. */
  constructor() {
    super();
  }

  /** Renders the shared-role catalog in the same active typography system used by pages. */
  render(): string {
    const { roles } = designTypographyContent;

    return HTML`
      <section id="design-roles" class="design-roles design-section" aria-labelledby="design-roles-title">
        <header class="design-section-heading">
          <p class="type-eyebrow design-eyebrow">${roles.eyebrow}</p>
          <h2 id="design-roles-title" class="type-section">${roles.title}</h2>
          <p class="type-lede">${roles.lede}</p>
        </header>

        <div class="design-role-grid">
          ${roles.cards.map((role, index) => HTML`
            <article class="design-role-card design-role-card--${ROLE_CARD_CLASSES[index]}">
              <div class="design-role-card-meta">
                <p class="type-label">${role.label}</p>
                <code>${role.token}</code>
              </div>
              <p class="design-role-sample">${role.sample}</p>
              <p class="design-role-note">${role.note}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }
}
