import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProjectsByTier } from "@app/data/showcase-content.ts";

@Component({
  selector: "showcase-featured",
  shadow: false,
})
export class ShowcaseFeaturedComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const projects = getShowcaseProjectsByTier("featured");

    return HTML`
      <section class="showcase-section showcase-featured-section" aria-labelledby="showcase-featured-title">
        <div class="mx-auto max-w-6xl px-5 sm:px-8">
          <p class="showcase-eyebrow showcase-reveal" data-showcase-reveal>Featured</p>
          <div class="mt-4 flex flex-wrap items-end justify-between gap-5">
            <h2 id="showcase-featured-title" class="showcase-title showcase-reveal" data-showcase-reveal>Selected builds</h2>
            <p class="showcase-section-note showcase-reveal" data-showcase-reveal>Useful things, shipped with intent.</p>
          </div>
          <div class="showcase-card-grid mt-12">
            ${projects.map((project) => `<showcase-project-card project-slug="${project.slug}"></showcase-project-card>`).join("")}
          </div>
        </div>
      </section>
    `;
  }
}

