import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-rendering";
import { designElementContent } from "@app/data/design-element-content.ts";

/**
 * Opens the `/design/element` reference with the action-button and anchor-link contracts.
 *
 * This section is static: it reads page-owned copy and has no handlers or local state. The
 * following showcase provides interaction, so this opening remains a stable explanation of
 * the production component rather than a second implementation.
 *
 * Selector: `design-element-overview`.
 */
@Component({ selector: "design-element-overview", shadow: false })
export class DesignElementOverviewComponent extends BaseElement {
  /** Creates the static section; all visible copy remains in `design-element-content.ts`. */
  constructor() {
    super();
  }

  /** Renders the design page's introductory copy and compact trait list from its authored content model. */
  render() {
    const { overview } = designElementContent;
    return html`
      <section class="design-element-overview layout-page layout-section-hero" aria-labelledby="design-element-overview-title">
        <div class="design-element-overview__layout layout-grid-rail">
          <div class="design-element-overview__intro">
            <p class="type-eyebrow">${overview.eyebrow}</p>
            <h1 id="design-element-overview-title" class="type-display">${overview.title}</h1>
            <p class="type-lede">${overview.lede}</p>
            <div class="design-element-overview__links layout-row layout-row-loose">
              ${overview.links.map((link) => html`<a class="app-link app-link--text" href="${link.href}">${link.label} <span aria-hidden="true">${link.indicator}</span></a>`)}
            </div>
          </div>
          <aside class="design-element-overview__summary" aria-label="${overview.summaryAriaLabel}">
            <p class="type-label">${overview.summaryLabel}</p>
            <dl>
              ${overview.summary.map((item) => html`<div><dt>${item.label}</dt><dd><code>${item.value}</code></dd></div>`)}
            </dl>
          </div>
        </div>
        <ul class="design-element-overview__tags layout-row layout-row-tight" aria-label="${overview.tagsAriaLabel}">
          ${overview.tags.map((tag) => html`<li>${tag}</li>`)}
        </ul>
      </section>
    `;
  }
}
