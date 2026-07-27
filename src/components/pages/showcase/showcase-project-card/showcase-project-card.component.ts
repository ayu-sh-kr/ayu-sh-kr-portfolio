import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProject } from "@app/data/showcase-content.ts";

@Component({
  selector: "showcase-project-card",
  shadow: false,
})
export class ShowcaseProjectCardComponent extends BaseElement {
  @Property({ name: "project-slug", type: String })
  projectSlug = "";

  constructor() {
    super();
  }

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

