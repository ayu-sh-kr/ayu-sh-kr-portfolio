import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-rendering";
import { designLayoutContent } from "@app/data/design-layout-content.ts";

/** Introduces the shared page frame and its purpose. */
@Component({
  selector: "design-layout-overview",
  shadow: false,
})
export class DesignLayoutOverviewComponent extends BaseElement {
  /** Creates the static layout overview element. */
  constructor() {
    super();
  }

  /** Renders the layout introduction and a live page-frame specimen. */
  render() {
    const { overview } = designLayoutContent;

    return html`
      <section id="design-layout-overview" class="design-layout-overview layout-page layout-section-hero" aria-labelledby="design-layout-overview-title">
        <div class="layout-stack layout-stack-lg">
          <div class="layout-stack layout-stack-sm">
            <p class="type-eyebrow">${overview.eyebrow}</p>
            <h1 id="design-layout-overview-title" class="type-display">${overview.title}</h1>
            <p class="type-lede">${overview.lede}</p>
          </div>
          <div class="design-layout-frame" aria-label="${overview.frame.ariaLabel}">
            <span class="type-label">${overview.frame.label}</span>
            <strong>${overview.frame.value}</strong>
          </div>
        </div>
      </section>
    `;
  }
}
