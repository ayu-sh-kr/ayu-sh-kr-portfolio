import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designContent} from "@app/data/design-content.ts";

/**
 * Owns the final shipping checklist and its reference links.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-index-shipping`.
 */
@Component({selector: "design-index-shipping", shadow: false})
export class DesignIndexShippingComponent extends BaseElement {
  /** Renders this independent reference section from its authored content model. */
  render(): TemplateResult {
    const { ship } = designContent.index;

    return html`
      <section
        id="ship"
        data-design-index-section
        class="design-index-reference__section layout-section-end"
        aria-labelledby="ship-title"
      >
        <p class="design-index-reference__number type-eyebrow">${ship.number}</p>
        <h2 id="ship-title" class="type-section">${ship.title}</h2>
        <p class="type-lede">${ship.lede}</p>
        <ol class="design-index-reference__checks">
          ${designContent.checks.map((check) => html`<li>${check}</li>`)}
        </ol>
        <p class="design-index-reference__accent-note">
          <strong>${ship.accentWarning}</strong> ${ship.accentResolution}
        </p>
        <div class="design-index-reference__actions layout-row">
          ${ship.actions.map(
            (action) => html`<a class="${action.className}" href="${action.href}">${action.label}</a>`
          )}
        </div>
      </section>
    `;
  }
}
