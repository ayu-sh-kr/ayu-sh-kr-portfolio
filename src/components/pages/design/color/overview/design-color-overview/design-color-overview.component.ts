import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-rendering";
import { designColorContent } from "@app/data/design-color-content.ts";

/** Identifies summary values that should render as code rather than plain text. */
const CODE_SUMMARY_ITEMS = new Set([0, 2]);

/**
 * Introduces the color grammar and exposes the active primary scale.
 *
 * Swatches reference `--primary-*` aliases, never fixed values, making theme
 * changes immediately visible to the people maintaining this application.
 */
@Component({
  selector: "design-color-overview",
  shadow: false,
})
export class DesignColorOverviewComponent extends BaseElement {
  /** Creates the static color overview element. */
  constructor() {
    super();
  }

  /** Renders the token-source summary and active primary-scale specimen. */
  render() {
    const { overview } = designColorContent;

    return html`
      <section class="design-color-overview design-section" aria-labelledby="design-color-overview-title">
        <div class="design-color-overview-layout">
          <div class="design-color-overview-intro">
            <p class="type-eyebrow design-eyebrow">${overview.eyebrow}</p>
            <h1 id="design-color-overview-title" class="type-display design-color-overview-title">${overview.title}</h1>
            <p class="type-lede design-color-overview-lede">${overview.lede}</p>
            <div class="design-overview-links">
              ${overview.links.map((link) => html`<a class="design-overview-link" href="${link.href}">${link.label} <span aria-hidden="true">${link.indicator}</span></a>`).join("")}
            </div>
          </div>

          <aside class="design-overview-summary" aria-label="${overview.summaryAriaLabel}">
            <p class="type-label design-summary-label">${overview.summaryLabel}</p>
            <dl class="design-summary-list">
              ${overview.summary.map((item, index) => html`<div><dt>${item.label}</dt><dd>${CODE_SUMMARY_ITEMS.has(index) ? html`<code>${item.value}</code>` : item.value}</dd></div>`).join("")}
            </dl>
          </aside>
        </div>

        <div class="design-primary-scale" aria-label="${overview.scaleAriaLabel}">
          ${overview.primaryShades.map((shade) => html`
            <div class="design-primary-swatch">
              <span class="design-primary-swatch-color" style="--design-swatch: var(--primary-${shade});"></span>
              <span class="type-label design-primary-swatch-label">${shade}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }
}
