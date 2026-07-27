import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProject } from "@app/data/showcase-content.ts";

/**
 * Renders one featured project as a navigable showcase card.
 *
 * The parent supplies a stable `project-slug`; the shared catalog remains the
 * source of truth for title, visual, summary, and stack data. The card delegates
 * its cover artwork to `showcase-visual` and links to the case-study view.
 *
 * Selector: `showcase-project-card`.
 */
@Component({
  selector: "showcase-project-card",
  shadow: false,
})
export class ShowcaseProjectCardComponent extends BaseElement {
  /** Attribute `project-slug`; identifies the catalog entry rendered by this card. */
  @Property({ name: "project-slug", type: String })
  projectSlug = "";

  constructor() {
    super();
  }

  /** Renders the matching project card, or nothing when the slug is unknown. */
  render(): string {
    const project = getShowcaseProject(this.projectSlug);
    if (!project) {
      return "";
    }

    return HTML`
      <a class="showcase-card showcase-reveal" data-showcase-reveal href="/showcase/${project.slug}">
        <div class="showcase-card-cover">
          <showcase-visual project-slug="${project.slug}" variant="card"></showcase-visual>
          <span class="showcase-card-arrow" aria-hidden="true">↗</span>
        </div>
        <div class="showcase-card-body">
          <span class="showcase-chip">${project.kind}</span>
          <h3 class="mt-4">${project.title}</h3>
          <p class="mt-3">${project.tagline}</p>
          <div class="showcase-chip-row mt-5" aria-label="Technology stack">
            ${project.stack.map((item) => `<span class="showcase-chip showcase-chip-muted">${item}</span>`).join("")}
          </div>
        </div>
      </a>
    `;
  }
}
