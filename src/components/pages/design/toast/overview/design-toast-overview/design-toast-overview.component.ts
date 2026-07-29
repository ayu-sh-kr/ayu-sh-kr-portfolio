import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designToastContent } from "@app/data/design-toast-content.ts";

/**
 * Opening section of the `/design/toast` reference route.
 *
 * It renders only authored orientation copy and tags; interactive behavior belongs to the
 * following showcase so this component remains a stable explanation of the toast grammar.
 *
 * Selector: `design-toast-overview`.
 */
@Component({ selector: "design-toast-overview", shadow: false })
export class DesignToastOverviewComponent extends BaseElement {
  /** Creates the static first section of the toast reference route. */
  constructor() {
    super();
  }

  /** Renders the route introduction and toast contract tags. */
  render(): string {
    const { overview } = designToastContent;
    return HTML`
      <section class="design-toast-overview layout-page layout-section-hero" aria-labelledby="design-toast-overview-title">
        <div class="design-toast-overview__copy layout-stack layout-stack-sm">
          <p class="type-eyebrow">${overview.eyebrow}</p>
          <h1 id="design-toast-overview-title" class="type-display">${overview.title}</h1>
          <p class="type-lede">${overview.lede}</p>
          <ul class="design-toast-overview__tags" aria-label="Toast properties">
            ${overview.tags.map((tag) => HTML`<li>${tag}</li>`).join("")}
          </ul>
        </div>
      </section>
    `;
  }
}
