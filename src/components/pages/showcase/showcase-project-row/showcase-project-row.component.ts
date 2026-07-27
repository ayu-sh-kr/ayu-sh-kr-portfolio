import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProject } from "@app/data/showcase-content.ts";

@Component({
  selector: "showcase-project-row",
  shadow: false,
})
export class ShowcaseProjectRowComponent extends BaseElement {
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
      <a class="showcase-row" data-showcase-reveal href="/showcase/${project.slug}">
        <span class="showcase-row-year">${project.year}</span>
        <span class="showcase-row-copy">
          <strong>${project.title}</strong>
          <span>${project.tagline}</span>
        </span>
        <span class="showcase-chip showcase-row-kind">${project.kind}</span>
        <span class="showcase-row-arrow" aria-hidden="true">→</span>
      </a>
    `;
  }
}

