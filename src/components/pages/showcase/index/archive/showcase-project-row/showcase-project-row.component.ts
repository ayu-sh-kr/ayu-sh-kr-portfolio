import { BaseElement, BindEvent, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProject } from "@app/data/showcase-content.ts";
import { publishAnalyticsEvent } from "@app/utils/analytics.utils.ts";

/**
 * Renders one archive project as a compact, navigable row.
 *
 * The row accepts only a slug and reads the rest of its display data from the
 * shared showcase catalog, keeping archive layout independent from content.
 *
 * Selector: `showcase-project-row`.
 */
@Component({
  selector: "showcase-project-row",
  shadow: false,
})
export class ShowcaseProjectRowComponent extends BaseElement {
  /** Attribute `project-slug`; identifies the catalog entry rendered by this row. */
  @Property({ name: "project-slug", type: String })
  projectSlug = "";

  constructor() {
    super();
  }

  /** Records a showcase project opened from the archive list. */
  @BindEvent({event: "click", id: "[data-analytics-project]"})
  trackProjectOpen(): void {
    if (!this.projectSlug) {
      return;
    }

    publishAnalyticsEvent({
      eventName: "project_open",
      params: {kind: "showcase", slug: this.projectSlug, surface: "showcase_index"},
    });
  }

  /** Renders the matching project summary, or nothing when the slug is unknown. */
  render(): string {
    const project = getShowcaseProject(this.projectSlug);
    if (!project) {
      return "";
    }

    return HTML`
      <a class="showcase-row" data-showcase-reveal data-analytics-project="showcase" href="/showcase/${project.slug}">
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
