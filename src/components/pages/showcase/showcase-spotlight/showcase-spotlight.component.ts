import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProject } from "@app/data/showcase-content.ts";

/**
 * Renders one scroll-driven spotlight case study on the showcase landing page.
 *
 * Project content comes from the shared catalog while the motion controller
 * targets the emitted data attributes to animate the cover, copy, chips, and
 * metric. The element itself remains a pure project-to-markup boundary.
 *
 * Selector: `showcase-spotlight`.
 */
@Component({
  selector: "showcase-spotlight",
  shadow: false,
})
export class ShowcaseSpotlightComponent extends BaseElement {
  /** Attribute `project-slug`; identifies the spotlight project to render. */
  @Property({ name: "project-slug", type: String })
  projectSlug = "";

  constructor() {
    super();
  }

  /** Renders the spotlight case study, or nothing when the slug is unknown. */
  render(): string {
    const project = getShowcaseProject(this.projectSlug);
    if (!project) {
      return "";
    }

    const metric = project.metric
      ? `
          <div class="showcase-metric-row mt-8">
            <strong class="showcase-metric" data-showcase-metric data-metric-value="${project.metric.value}">0</strong>
            <span class="showcase-lede">${project.metric.label}</span>
          </div>
        `
      : "";

    return HTML`
      <div id="showcase-spotlight-${project.slug}" class="showcase-pin-wrap showcase-spotlight-wrap" data-showcase-spotlight>
        <section class="showcase-pin-stage showcase-spotlight-stage" aria-labelledby="spotlight-${project.slug}-title">
          <div class="showcase-ghost-number" aria-hidden="true">${project.year.toString().slice(-2)}</div>
          <div class="showcase-spotlight-layout mx-auto grid w-full max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div class="showcase-spotlight-cover" data-showcase-cover>
              <showcase-visual project-slug="${project.slug}" variant="spotlight"></showcase-visual>
            </div>
            <div class="showcase-spotlight-copy">
              <p class="showcase-eyebrow">Spotlight · ${project.kind}</p>
              <h2 id="spotlight-${project.slug}-title" class="showcase-title mt-4">${project.title}</h2>
              <p class="showcase-lede mt-5 max-w-xl">${project.tagline}</p>
              <div class="showcase-chip-row mt-7" aria-label="Technology stack">
                ${project.stack.map((item, index) => `<span class="showcase-chip" data-showcase-chip style="--chip-index:${index}">${item}</span>`).join("")}
              </div>
              ${metric}
              <a class="showcase-button showcase-button-ink mt-9" href="/showcase/${project.slug}">
                View case study <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    `;
  }
}
