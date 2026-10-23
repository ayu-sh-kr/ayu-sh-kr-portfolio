import "./showcase-featured.component.css";
import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProjectsByTier } from "@app/data/showcase-content.ts";

/**
 * Composes featured-tier projects into the showcase card grid.
 *
 * Project content comes from `showcaseProjects`; each card receives only its
 * slug so `showcase-project-card` remains responsible for item rendering.
 *
 * Selector: `showcase-featured`.
 */
@Component({
  selector: "showcase-featured",
  shadow: false,
})
export class ShowcaseFeaturedComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders the featured project section and delegates cards to child elements. */
  render(): TemplateResult {
    const projects = getShowcaseProjectsByTier("featured");

    return html`
      <section
        class="showcase-featured-section layout-page layout-section"
        aria-labelledby="showcase-featured-title"
      >
        <div>
          <p class="showcase-eyebrow showcase-reveal" data-showcase-reveal>Featured</p>
          <div class="mt-4 flex flex-wrap items-end justify-between gap-5">
            <h2
              id="showcase-featured-title"
              class="showcase-title showcase-reveal"
              data-showcase-reveal
            >
              Selected builds
            </h2>
            <p class="showcase-section-note showcase-reveal" data-showcase-reveal>
              Useful things, shipped with intent.
            </p>
          </div>
          <div class="showcase-card-grid mt-12">
            ${projects.map(
              (project) =>
                html`<showcase-project-card project-slug="${project.slug}"></showcase-project-card>`
            )}
          </div>
        </div>
      </section>
    `;
  }
}
