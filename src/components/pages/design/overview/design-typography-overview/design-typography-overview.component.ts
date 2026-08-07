import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { designTypographyContent } from "@app/data/design-typography-content.ts";

/** Identifies summary values that should render as code rather than plain text. */
const CODE_SUMMARY_ITEMS = new Set([0, 1]);

/**
 * Introduces the typography design grammar and its hierarchy.
 *
 * Used only by the `/design` route. The specimens deliberately inherit the
 * app's active font and semantic colors, making the section a quick visual
 * check of the tokens that public pages consume.
 */
@Component({
  selector: "design-typography-overview",
  shadow: false,
})
export class DesignTypographyOverviewComponent extends BaseElement {
  /** Creates the static overview element. */
  constructor() {
    super();
  }

  /** Renders the route introduction, shared-token summary, and role flow. */
  render() {
    const { overview } = designTypographyContent;

    return html`
      <section class="design-overview design-section" aria-labelledby="design-overview-title">
        <div class="design-overview-layout">
          <div class="design-overview-intro">
            <p class="type-eyebrow design-eyebrow">${overview.eyebrow}</p>
            <h1 id="design-overview-title" class="type-display design-overview-title">${overview.title}</h1>
            <p class="type-lede design-overview-lede">${overview.lede}</p>
            <div class="design-overview-links">
              ${overview.links.map((link) => html`<a class="design-overview-link" href="${link.href}">${link.label} <span aria-hidden="true">${link.indicator}</span></a>`)}
            </div>
          </div>

          <aside class="design-overview-summary" aria-label="${overview.summaryAriaLabel}">
            <p class="type-label design-summary-label">${overview.summaryLabel}</p>
            <dl class="design-summary-list">
              ${overview.summary.map((item, index) => html`<div><dt>${item.label}</dt><dd>${CODE_SUMMARY_ITEMS.has(index) ? html`<code>${item.value}</code>` : item.value}</dd></div>`)}
            </dl>
          </aside>
        </div>

        <div class="design-role-flow" aria-label="${overview.roleFlowAriaLabel}">
          ${overview.roleFlow.map((role, index) => html`${index ? html`<span aria-hidden="true">→</span>` : ""}<span class="design-flow-item">${role}</span>`)}
        </div>
      </section>
    `;
  }
}
