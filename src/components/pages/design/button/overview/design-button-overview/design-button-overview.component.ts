import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designButtonContent } from "@app/data/design-button-content.ts";

/**
 * Opens the `/design/button` reference with the action-button contract and its key traits.
 *
 * This section is static: it reads page-owned copy and has no handlers or local state. The
 * following showcase provides interaction, so this opening remains a stable explanation of
 * the production component rather than a second implementation.
 *
 * Selector: `design-button-overview`.
 */
@Component({ selector: "design-button-overview", shadow: false })
export class DesignButtonOverviewComponent extends BaseElement {
  /** Creates the static section; all visible copy remains in `design-button-content.ts`. */
  constructor() {
    super();
  }

  /** Renders the design page's introductory copy and compact trait list from its authored content model. */
  render(): string {
    const { overview } = designButtonContent;
    return HTML`
      <section class="design-button-overview layout-page layout-section-hero" aria-labelledby="design-button-overview-title">
        <div class="design-button-overview__layout layout-grid-rail">
          <div class="design-button-overview__intro">
            <p class="type-eyebrow">${overview.eyebrow}</p>
            <h1 id="design-button-overview-title" class="type-display">${overview.title}</h1>
            <p class="type-lede">${overview.lede}</p>
            <div class="design-button-overview__links layout-row layout-row-loose">
              ${overview.links.map((link) => HTML`<a href="${link.href}">${link.label} <span aria-hidden="true">${link.indicator}</span></a>`).join("")}
            </div>
          </div>
          <aside class="design-button-overview__summary" aria-label="${overview.summaryAriaLabel}">
            <p class="type-label">${overview.summaryLabel}</p>
            <dl>
              ${overview.summary.map((item) => HTML`<div><dt>${item.label}</dt><dd><code>${item.value}</code></dd></div>`).join("")}
            </dl>
          </div>
        </div>
        <ul class="design-button-overview__tags layout-row layout-row-tight" aria-label="Action button traits">
          ${overview.tags.map((tag) => HTML`<li>${tag}</li>`).join("")}
        </ul>
      </section>
    `;
  }
}
