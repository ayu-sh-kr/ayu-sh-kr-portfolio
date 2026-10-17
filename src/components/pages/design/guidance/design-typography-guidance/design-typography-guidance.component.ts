import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { designTypographyContent } from "@app/data/design-typography-content.ts";

/** Preserves the distinct markup and presentation roles of the three pairing specimens. */
const PAIRING_LAYOUTS = [
  { cardClass: "", headingTag: "p", headingClass: "type-section design-pair-heading", bodyClass: "type-lede design-pair-lede" },
  { cardClass: "", headingTag: "h3", headingClass: "design-card-heading", bodyClass: "design-card-copy" },
  { cardClass: "design-guidance-card--contrast", headingTag: "p", headingClass: "type-price design-estimate", bodyClass: "design-card-copy" },
] as const;

/**
 * Explains how the shared typography roles should be combined and checked.
 *
 * This is the reference's decision-making section: it pairs the live specimens
 * with the constraints that keep new components aligned with existing routes.
 */
@Component({
  selector: "design-typography-guidance",
  shadow: false,
})
export class DesignTypographyGuidanceComponent extends BaseElement {
  /** Creates the static guidance element. */
  constructor() {
    super();
  }

  /** Renders role pairings, a prose sample, and a compact implementation checklist. */
  render(): TemplateResult {
    const { guidance } = designTypographyContent;

    return html`
      <section class="design-guidance design-section" aria-labelledby="design-guidance-title">
        <header class="design-section-heading">
          <p class="type-eyebrow design-eyebrow">${guidance.eyebrow}</p>
          <h2 id="design-guidance-title" class="type-section">${guidance.title}</h2>
          <p class="type-lede">${guidance.lede}</p>
        </header>

        <div class="design-guidance-grid">
          ${guidance.pairings.map((pairing, index) => {
            const layout = PAIRING_LAYOUTS[index];

            return html`
              <article class="design-guidance-card ${layout.cardClass}">
                <p class="type-label">${pairing.label}</p>
                ${layout.headingTag === "h3"
                  ? html`<h3 class="${layout.headingClass}">${pairing.heading}</h3>`
                  : html`<p class="${layout.headingClass}">${pairing.heading}</p>`}
                <p class="${layout.bodyClass}">${pairing.body}</p>
                <code>${pairing.token}</code>
              </article>
            `;
          })}
        </div>

        <div class="design-prose-layout">
          <article class="design-prose-sample">
            <p class="type-label">${guidance.prose.label}</p>
            <h3>${guidance.prose.title}</h3>
            ${guidance.prose.paragraphs.map((paragraph) => html`<p>${paragraph}</p>`)}
            <a href="${guidance.prose.linkHref}"
              >${guidance.prose.linkLabel}
              <span aria-hidden="true">${guidance.prose.linkIndicator}</span></a
            >
          </article>

          <aside class="design-checklist" aria-label="${guidance.checklistAriaLabel}">
            <p class="type-label">${guidance.checklistLabel}</p>
            <ol>
              ${guidance.checklist.map((item) => html`<li>${item}</li>`)}
            </ol>
          </aside>
        </div>
      </section>
    `;
  }
}
