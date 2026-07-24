import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { getShowcaseProject } from "@app/data/showcase-content.ts";

@Component({
  selector: "showcase-visual",
  shadow: false,
})
export class ShowcaseVisualComponent extends BaseElement {
  @Property({ name: "project-slug", type: String })
  projectSlug = "";

  @Property({ name: "variant", type: String })
  variant = "card";

  constructor() {
    super();
  }

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

