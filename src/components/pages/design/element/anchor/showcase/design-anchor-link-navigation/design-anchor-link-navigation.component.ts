import "../../../design-element.css";
import "./design-anchor-link-navigation.component.css";
import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designElementContent} from "@app/data/design-element-content.ts";

/**
 * Renders the navigation anchor-link specimens for `/design/element`.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-anchor-link-navigation`.
 */
@Component({selector: "design-anchor-link-navigation", shadow: false})
export class DesignAnchorLinkNavigationComponent extends BaseElement {
  /** Renders this link family with native anchor navigation and safe text interpolation. */
  render(): TemplateResult {
    const {anchorLinks} = designElementContent;
    return html`
      <div class="design-anchor-link-showcase__navigation">
        <p class="type-eyebrow">${anchorLinks.navigation.eyebrow}</p>
        <h3 class="type-subsection">${anchorLinks.navigation.title}</h3>
        <p class="type-lede">${anchorLinks.navigation.lede}</p>
        <div class="design-anchor-link-showcase__navigation-grid layout-grid-2">
          ${anchorLinks.navigation.items.map(
            (item) => html`
              <article class="design-anchor-link-navigation-card">
                <h4 class="type-card-title">${item.title}</h4>
                <p>${item.body}</p>
                <a class="app-link ${item.classes}" href="${item.href}">${item.label}</a>
              </article>
            `
          )}
        </div>
      </div>
    `;
  }
}
