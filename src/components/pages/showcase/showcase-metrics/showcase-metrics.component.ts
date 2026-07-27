import {BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {escapeHtml} from "@app/utils/html.utils.ts";

type Metric = {value: string; label: string};

@Component({
  selector: "showcase-metrics",
  shadow: false,
})
export class ShowcaseMetricsComponent extends BaseElement {
  @Property({name: "items", type: String})
  items = "";

  constructor() {
    super();
  }

  private metrics(): Metric[] {
    return this.items
      .split(",")
      .map((item) => {
        const [value, ...labelParts] = item.split("|");
        return {value: value?.trim() ?? "", label: labelParts.join("|").trim()};
      })
      .filter((metric) => metric.value && metric.label);
  }

  render(): string {
    return HTML`
      <div class="showcase-metrics" role="group" aria-label="Key metrics">
        ${this.metrics()
          .map(
            (metric) => `
              <div class="showcase-metric">
                <strong>${escapeHtml(metric.value)}</strong>
                <span>${escapeHtml(metric.label)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }
}
