import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProjectsByTier } from "@app/data/showcase-content.ts";

@Component({
  selector: "showcase-page-content",
  shadow: false,
})
export class ShowcasePageComponent extends BaseElement {
  constructor() {
    super();
  }

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
        <showcase-support></showcase-support>
        <showcase-motion-controller></showcase-motion-controller>
      </main>
    `;
  }
}

