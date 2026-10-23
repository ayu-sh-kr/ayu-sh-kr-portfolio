import "../../../design-element.css";
import "./design-anchor-link-actions.component.css";
import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designElementContent} from "@app/data/design-element-content.ts";

/**
 * Renders the actions anchor-link specimens for `/design/element`.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-anchor-link-actions`.
 */
@Component({selector: "design-anchor-link-actions", shadow: false})
export class DesignAnchorLinkActionsComponent extends BaseElement {
  /** Renders this link family with native anchor navigation and safe text interpolation. */
  render(): TemplateResult {
    const {anchorLinks} = designElementContent;
    return html`
      <div class="design-element-showcase__grid layout-grid-auto-sm">
        ${anchorLinks.actions.map(
          (item) => html`
            <article class="design-element-specimen-card" data-variant="${item.variant}">
              <p class="type-label">${item.variant}</p>
              <h3 class="type-card-title">${item.title}</h3>
              <p>${item.body}</p>
              <a class="app-link ${item.classes}" href="${item.href}">${item.label}</a>
            </article>
          `
        )}
      </div>
    `;
  }
}
