import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProject } from "@app/data/showcase-content.ts";

/**
 * Produces the CSS-driven visual used by project cards and spotlights.
 *
 * The visual is intentionally data-driven: the project catalog selects the
 * visual family and this component derives its labels, while `variant` only
 * controls the size/context styling applied by the colocated CSS.
 *
 * Selector: `showcase-visual`.
 */
@Component({
  selector: "showcase-visual",
  shadow: false,
})
export class ShowcaseVisualComponent extends BaseElement {
  /** Attribute `project-slug`; selects the project whose visual is displayed. */
  @Property({ name: "project-slug", type: String })
  projectSlug = "";

  /** Attribute `variant`; accepts `card` or `spotlight` and selects the context styling. */
  @Property({ name: "variant", type: String })
  variant = "card";

  constructor() {
    super();
  }

  /** Renders labels for the project visual, or nothing when the slug is unknown. */
  render(): string {
    const project = getShowcaseProject(this.projectSlug);
    if (!project) {
      return "";
    }

    const labels = project.visual === "workspace"
      ? ["dota-core", "dota-router", "dota-ui", "dota-wrap"]
      : project.visual === "pipeline"
        ? ["SQS", "SNS", "EventBridge"]
        : project.visual === "rest"
          ? ["GET /data", "typed", "cache"]
          : [project.kind, project.year.toString(), project.status];

    return HTML`
      <div class="showcase-visual showcase-visual-${project.visual} showcase-visual-${this.variant}" aria-hidden="true">
        <div class="showcase-visual-grid"></div>
        <div class="showcase-visual-orbit showcase-visual-orbit-one"></div>
        <div class="showcase-visual-orbit showcase-visual-orbit-two"></div>
        <div class="showcase-visual-labels">
          ${labels.map((label) => `<span>${label}</span>`).join("")}
        </div>
        <strong>${project.title}</strong>
      </div>
    `;
  }
}
