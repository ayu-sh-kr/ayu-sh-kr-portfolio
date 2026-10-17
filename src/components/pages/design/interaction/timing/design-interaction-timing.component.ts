import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Lists the only six approved duration bands before maintainers select an interaction verb. */
@Component({ selector: "design-interaction-timing", shadow: false })
export class DesignInteractionTimingComponent extends BaseElement {
  /** Creates the static timing contract. */
  constructor() {
    super();
  }

  /** Renders the duration inventory and its allowed use for each band. */
  render(): TemplateResult {
    const { timing } = designInteractionContent;

    return html` <section
      id="timing"
      class="design-interaction-section layout-page layout-section"
      aria-labelledby="timing-title"
    >
      <header class="design-interaction-heading layout-stack layout-stack-sm">
        <p class="type-eyebrow">${timing.eyebrow}</p>
        <h2 id="timing-title" class="type-section">${timing.title}</h2>
        <p class="type-lede">${timing.lede}</p>
      </header>
      <dl class="design-interaction-timing">
        ${timing.durations.map(
          (duration) => html`<div>
            <dt>${duration.duration}</dt>
            <dd>${duration.use}</dd>
          </div>`
        )}
      </dl>
    </section>`;
  }
}
