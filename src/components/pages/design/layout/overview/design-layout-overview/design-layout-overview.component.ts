import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
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
  render(): string {
    const { overview } = designLayoutContent;

    return HTML`
      <section class="design-layout-overview layout-page" aria-labelledby="design-layout-overview-title">
        <p class="type-eyebrow">${overview.eyebrow}</p>
        <h1 id="design-layout-overview-title" class="type-display">${overview.title}</h1>
        <p class="type-lede">${overview.lede}</p>
        <div class="design-layout-frame" aria-label="80rem page frame specimen">
          <span class="type-label">Shared page frame</span>
          <strong>80rem</strong>
        </div>
      </section>
    `;
  }
}
