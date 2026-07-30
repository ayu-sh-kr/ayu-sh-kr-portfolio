import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
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
  render(): string {
    const { anchorLinks } = designElementContent;
    return HTML`
      <section id="design-element-anchor-showcase" class="design-anchor-link-showcase layout-page layout-section" aria-labelledby="design-element-anchor-showcase-title">
        <div class="design-element-showcase__heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${anchorLinks.eyebrow}</p>
          <h2 id="design-element-anchor-showcase-title" class="type-section">${anchorLinks.title}</h2>
          <p class="type-lede">${anchorLinks.lede}</p>
        </div>
        <div class="design-element-showcase__grid layout-grid-auto-sm">
          ${anchorLinks.actions.map((item) => HTML`
            <article class="design-element-specimen-card" data-variant="${item.variant}">
              <p class="type-label">${item.variant}</p>
              <h3 class="type-card-title">${item.title}</h3>
              <p>${item.body}</p>
              <a class="app-link ${item.classes}" href="${item.href}">${item.label}</a>
            </article>
          `).join("")}
        </div>
        <div class="design-anchor-link-showcase__navigation">
          <p class="type-eyebrow">${anchorLinks.navigation.eyebrow}</p>
          <h3 class="type-subsection">${anchorLinks.navigation.title}</h3>
          <p class="type-lede">${anchorLinks.navigation.lede}</p>
          <div class="design-anchor-link-showcase__navigation-grid layout-grid-2">
            ${anchorLinks.navigation.items.map((item) => HTML`
              <article class="design-anchor-link-navigation-card">
                <h4 class="type-card-title">${item.title}</h4>
                <p>${item.body}</p>
                <a class="app-link ${item.classes}" href="${item.href}">${item.label}</a>
              </article>
            `).join("")}
          </div>
        </div>
        <section class="design-anchor-link-showcase__family" aria-labelledby="design-element-anchor-text-title">
          <p class="type-eyebrow">${anchorLinks.text.eyebrow}</p>
          <h3 id="design-element-anchor-text-title" class="type-subsection">${anchorLinks.text.title}</h3>
          <p class="type-lede">${anchorLinks.text.lede}</p>
          <div class="design-anchor-link-showcase__family-grid layout-grid-2">
            ${anchorLinks.text.items.map((item) => HTML`
              <article class="design-anchor-link-text-card">
                <h4 class="type-card-title">${item.title}</h4>
                <p>${item.before} <a class="app-link ${item.classes}" href="${item.href}">${item.label}</a>${item.after}</p>
              </article>
            `).join("")}
          </div>
        </section>
        <section class="design-anchor-link-showcase__family" aria-labelledby="design-element-anchor-card-title">
          <p class="type-eyebrow">${anchorLinks.cards.eyebrow}</p>
          <h3 id="design-element-anchor-card-title" class="type-subsection">${anchorLinks.cards.title}</h3>
          <p class="type-lede">${anchorLinks.cards.lede}</p>
          <div class="design-anchor-link-showcase__family-grid layout-grid-2">
            ${anchorLinks.cards.items.map((item) => HTML`
              <article class="design-anchor-link-card">
                <h4 class="type-card-title">${item.title}</h4>
                <p>${item.body}</p>
                <a class="app-link ${item.classes}" href="${item.href}">${item.label}<span aria-hidden="true">→</span></a>
              </article>
            `).join("")}
          </div>
        </section>
      </section>
    `;
  }
}
