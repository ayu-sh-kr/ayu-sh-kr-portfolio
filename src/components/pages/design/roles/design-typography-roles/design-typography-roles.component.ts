import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

/** Defines the shared type roles shown by the visual catalog in their reading order. */
const ROLE_CARDS = [
  { className: "display", label: "Page hero", token: ".type-display", sample: "Make the work unmistakable.", note: "One per route, at the top of the reading order." },
  { className: "section", label: "Section heading", token: ".type-section", sample: "A clear next chapter", note: "Use for a page-level section, not for card chrome." },
  { className: "subsection", label: "Nested heading", token: ".type-subsection", sample: "The practical detail", note: "Keeps a nested group distinct without competing with its parent." },
  { className: "lede", label: "Introductory copy", token: ".type-lede", sample: "A short explanation gives the reader context before the denser content begins.", note: "One calm paragraph below a heading." },
  { className: "body", label: "Body copy", token: "--type-body-*", sample: "The shared baseline for paragraphs, descriptions, and any copy a reader needs to scan carefully.", note: "Inherited by default; do not recreate this scale locally." },
  { className: "compact", label: "Supporting copy", token: "--type-compact-*", sample: "Updated 12 March · 6 min read", note: "Use for metadata and quiet supporting detail, never as a body-text replacement." },
  { className: "card", label: "Card title", token: "--type-card-title-*", sample: "Focused card title", note: "A compact title for cards, questions, and grouped controls." },
  { className: "eyebrow", label: "Eyebrow", token: ".type-eyebrow", sample: "Project context", note: "Uppercase, tracked, and used to set context before a heading." },
  { className: "label", label: "Field label", token: ".type-label", sample: "Project budget", note: "Uppercase label text belongs with inputs, metadata, and small descriptors." },
  { className: "control", label: "Controls", token: "--type-control-*", sample: "Start a project", note: "Buttons and choices share one readable control weight." },
  { className: "metric", label: "Metrics", token: ".type-price", sample: "₹ 124,800", note: "Numbers that change use tabular figures to prevent visual jitter." },
] as const;

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
    return HTML`
      <section id="design-roles" class="design-roles design-section" aria-labelledby="design-roles-title">
        <header class="design-section-heading">
          <p class="type-eyebrow design-eyebrow">Design grammar / 02</p>
          <h2 id="design-roles-title" class="type-section">The roles, rendered live.</h2>
          <p class="type-lede">Choose a role by meaning, not by a font size. Every card below is a shared token that remains consistent between the home, pricing, support, editorial, and legal routes.</p>
        </header>

        <div class="design-role-grid">
          ${ROLE_CARDS.map((role) => HTML`
            <article class="design-role-card design-role-card--${role.className}">
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
