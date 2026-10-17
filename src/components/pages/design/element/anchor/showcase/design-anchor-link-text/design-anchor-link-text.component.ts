import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designElementContent} from "@app/data/design-element-content.ts";

/**
 * Renders the text anchor-link specimens for `/design/element`.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-anchor-link-text`.
 */
@Component({selector: "design-anchor-link-text", shadow: false})
export class DesignAnchorLinkTextComponent extends BaseElement {
  /** Renders this link family with native anchor navigation and safe text interpolation. */
  render(): TemplateResult {
    const {anchorLinks} = designElementContent;
    return html`
      <section
        class="design-anchor-link-showcase__family"
        aria-labelledby="design-element-anchor-text-title"
      >
        <p class="type-eyebrow">${anchorLinks.text.eyebrow}</p>
        <h3 id="design-element-anchor-text-title" class="type-subsection">${anchorLinks.text.title}</h3>
        <p class="type-lede">${anchorLinks.text.lede}</p>
        <div class="design-anchor-link-showcase__family-grid layout-grid-2">
          ${anchorLinks.text.items.map(
            (item) => html`
              <article class="design-anchor-link-text-card">
                <h4 class="type-card-title">${item.title}</h4>
                <p>
                  ${item.before}
                  <a class="app-link ${item.classes}" href="${item.href}">${item.label}</a>${item.after}
                </p>
              </article>
            `
          )}
        </div>
      </section>
    `;
  }
}
