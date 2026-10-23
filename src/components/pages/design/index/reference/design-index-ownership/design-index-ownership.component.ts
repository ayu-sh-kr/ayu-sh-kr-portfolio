import "./design-index-ownership.component.css";
import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designContent} from "@app/data/design-content.ts";

/**
 * Explains ownership boundaries and the precedence rule for the design system.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-index-ownership`.
 */
@Component({selector: "design-index-ownership", shadow: false})
export class DesignIndexOwnershipComponent extends BaseElement {
  /** Renders this independent reference section from its authored content model. */
  render(): TemplateResult {
    const { ownership } = designContent.index;

    return html`
      <section
        id="map"
        data-design-index-section
        class="design-index-reference__section layout-section"
        aria-labelledby="map-title"
      >
        <p class="design-index-reference__number type-eyebrow">${ownership.number}</p>
        <h2 id="map-title" class="type-section">${ownership.title}</h2>
        <p class="type-lede">${ownership.lede}</p>
        <div class="design-index-reference__table" role="region" aria-label="${ownership.ariaLabel}">
          <div
            class="design-index-reference__table-row design-index-reference__table-row--head"
            role="row"
          >
            ${ownership.headers.map((header) => html`<span role="columnheader">${header}</span>`)}
          </div>
          ${designContent.ownership.map(
            (item) => html`
              <div class="design-index-reference__table-row" role="row">
                <strong role="cell">${item.layer}</strong><span role="cell">${item.owns}</span
                ><span role="cell">${item.excludes}</span><code role="cell">${item.source}</code>
              </div>
            `
          )}
        </div>
        <aside class="design-index-reference__note" aria-label="${ownership.note.ariaLabel}">
          <p class="type-label">${ownership.note.label}</p>
          <p>${ownership.note.body}</p>
          <p><strong>${ownership.note.warning}</strong> ${ownership.note.resolution}</p>
        </aside>
      </section>
    `;
  }
}
