import "../../../design-element.css";
import "./design-anchor-link-cards.component.css";
import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designElementContent} from "@app/data/design-element-content.ts";

/**
 * Renders the cards anchor-link specimens for `/design/element`.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-anchor-link-cards`.
 */
@Component({selector: "design-anchor-link-cards", shadow: false})
export class DesignAnchorLinkCardsComponent extends BaseElement {
  /** Renders this link family with native anchor navigation and safe text interpolation. */
  render(): TemplateResult {
    const {anchorLinks} = designElementContent;
    return html`
      <section
        class="design-anchor-link-showcase__family"
        aria-labelledby="design-element-anchor-card-title"
      >
        <p class="type-eyebrow">${anchorLinks.cards.eyebrow}</p>
        <h3 id="design-element-anchor-card-title" class="type-subsection">
          ${anchorLinks.cards.title}
        </h3>
        <p class="type-lede">${anchorLinks.cards.lede}</p>
        <div class="design-anchor-link-showcase__family-grid layout-grid-2">
          ${anchorLinks.cards.items.map(
            (item) => html`
              <article class="design-anchor-link-card">
                <h4 class="type-card-title">${item.title}</h4>
                <p>${item.body}</p>
                <a class="app-link ${item.classes}" href="${item.href}"
                  >${item.label}<span aria-hidden="true">→</span></a
                >
              </article>
            `
          )}
        </div>
      </section>
    `;
  }
}
