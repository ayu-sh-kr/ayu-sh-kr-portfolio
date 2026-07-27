import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProjectsByTier } from "@app/data/showcase-content.ts";

/**
 * Composes the public showcase landing page content.
 *
 * This shell owns section order and passes project slugs to spotlight children;
 * individual sections remain responsible for their own content and rendering.
 * The motion controller is included as a behavior-only child with no markup.
 *
 * Selector: `showcase-page-content`.
 */
@Component({
  selector: "showcase-page-content",
  shadow: false,
})
export class ShowcasePageComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders the page sections and one spotlight element for each spotlight project. */
  render(): string {
    const spotlights = getShowcaseProjectsByTier("spotlight");

    return HTML`
      <main class="showcase-page">
        <showcase-hero></showcase-hero>
        <div class="showcase-spotlight-index" aria-hidden="true">
          ${spotlights.map((project) => `<span data-showcase-spotlight-index title="${project.title}"></span>`).join("")}
        </div>
        ${spotlights.map((project) => `<showcase-spotlight project-slug="${project.slug}"></showcase-spotlight>`).join("")}
        <showcase-featured></showcase-featured>
        <showcase-archive></showcase-archive>
        <showcase-support data-analytics-section="showcase_support"></showcase-support>
        <showcase-motion-controller></showcase-motion-controller>
      </main>
    `;
  }
}
