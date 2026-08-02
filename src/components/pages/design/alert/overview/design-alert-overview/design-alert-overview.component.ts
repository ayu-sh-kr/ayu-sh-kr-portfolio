import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designAlertContent } from "@app/data/design-alert-content.ts";

/** Introduces the native-dialog contract used by every application alert. */
@Component({
  selector: "design-alert-overview",
  shadow: false,
})
export class DesignAlertOverviewComponent extends BaseElement {
  /** Creates the static overview element. */
  constructor() {
    super();
  }

  /** Renders the route introduction and the three facts that define an alert. */
  render(): string {
    const { overview } = designAlertContent;

    return HTML`
      <section id="design-alert-overview" class="design-alert-overview layout-page layout-section-hero" aria-labelledby="design-alert-overview-title">
        <div class="design-alert-overview-copy layout-stack layout-stack-sm">
          <p class="type-eyebrow">${overview.eyebrow}</p>
          <h1 id="design-alert-overview-title" class="type-display">${overview.title}</h1>
          <p class="type-lede">${overview.lede}</p>
          <ul class="design-alert-overview-tags" aria-label="${overview.tagsAriaLabel}">
            ${overview.tags.map((tag) => HTML`<li>${tag}</li>`).join("")}
          </ul>
        </div>
      </section>
    `;
  }
}
