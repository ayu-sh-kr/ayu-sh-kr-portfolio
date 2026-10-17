import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designContent} from "@app/data/design-content.ts";

/**
 * Lists task-specific reading paths through the design system.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-index-routes`.
 */
@Component({selector: "design-index-routes", shadow: false})
export class DesignIndexRoutesComponent extends BaseElement {
  /** Renders this independent reference section from its authored content model. */
  render(): TemplateResult {
    const { routes } = designContent.index;

    return html`
      <section
        id="routes"
        data-design-index-section
        class="design-index-reference__section layout-section"
        aria-labelledby="routes-title"
      >
        <p class="design-index-reference__number type-eyebrow">${routes.number}</p>
        <h2 id="routes-title" class="type-section">${routes.title}</h2>
        <p class="type-lede">${routes.lede}</p>
        <dl class="design-index-reference__routes">
          ${designContent.routes.map(
            (route) =>
              html`<div>
                <dt>${route.task}</dt>
                <dd>${route.path}</dd>
              </div>`
          )}
        </dl>
      </section>
    `;
  }
}
