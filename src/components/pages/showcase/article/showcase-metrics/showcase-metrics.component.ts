import {BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {escapeHtml} from "@app/utils/html.utils.ts";

/** One validated metric displayed by the authored metrics list. */
type Metric = {
  /** Short metric value, such as a count or percentage. */
  value: string;
  /** Human-readable meaning of the value. */
  label: string;
};

/**
 * Parses a compact metrics attribute and renders accessible metric items.
 *
 * The attribute uses comma-separated entries in the form `value|label` so
 * Markdown-authored content can provide multiple metrics without embedding
 * markup. Invalid or incomplete entries are omitted before rendering.
 *
 * Selector: `showcase-metrics`.
 */
@Component({
  selector: "showcase-metrics",
  shadow: false,
})
export class ShowcaseMetricsComponent extends BaseElement {
  /** Attribute `items`; comma-separated `value|label` entries, defaulting to empty. */
  @Property({name: "items", type: String})
  items = "";

  constructor() {
    super();
  }

  /** Parses and validates the authored metrics attribute for rendering. */
  private metrics(): Metric[] {
    return this.items
      .split(",")
      .map((item) => {
        const [value, ...labelParts] = item.split("|");
        return {value: value?.trim() ?? "", label: labelParts.join("|").trim()};
      })
      .filter((metric) => metric.value && metric.label);
  }

  /** Renders each validated metric with escaped value and label text. */
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
