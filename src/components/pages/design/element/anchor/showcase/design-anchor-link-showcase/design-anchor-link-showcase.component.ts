import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { designElementContent } from "@app/data/design-element-content.ts";

/**
 * Renders declarative anchor-link variants for the `/design/element` reference route.
 *
 * Every specimen remains a native anchor with an href, so the shared CSS improves presentation
 * without replacing routing, hash navigation, or normal browser link behavior.
 *
 * Selector: `design-anchor-link-showcase`.
 */
@Component({ selector: "design-anchor-link-showcase", shadow: false })
export class DesignAnchorLinkShowcaseComponent extends BaseElement {
  /** Creates the static anchor specimen section; links need no lifecycle or event handlers. */
  constructor() {
    super();
  }

  /** Renders CTA, text, card, and navigation link variants from the page-owned content model. */
  render(): TemplateResult {
    const { anchorLinks } = designElementContent;
    return html`
      <section
        id="design-element-anchor-showcase"
        class="design-anchor-link-showcase layout-page layout-section"
        aria-labelledby="design-element-anchor-showcase-title"
      >
        <div class="design-element-showcase__heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${anchorLinks.eyebrow}</p>
          <h2 id="design-element-anchor-showcase-title" class="type-section">${anchorLinks.title}</h2>
          <p class="type-lede">${anchorLinks.lede}</p>
        </div>
        <design-anchor-link-actions></design-anchor-link-actions>
        <design-anchor-link-navigation></design-anchor-link-navigation>
        <design-anchor-link-text></design-anchor-link-text>
        <design-anchor-link-cards></design-anchor-link-cards>
      </section>
    `;
  }
}
