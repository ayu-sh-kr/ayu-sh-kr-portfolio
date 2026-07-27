import {BaseElement, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";

/** Renders repeated archive-row placeholders for delayed list data. */
@Component({
  selector: "sk-list",
  shadow: false,
})
export class SkeletonListComponent extends BaseElement {
  /** Number of placeholder rows, clamped to the range described by iteration 12. */
  @Property({name: "rows", type: String})
  rows = "4";

  constructor() {
    super();
  }

  /** Mirrors the archive date, title/summary, and category columns. */
  render(): string {
    const count = Math.min(6, Math.max(4, Number.parseInt(this.rows, 10) || 4));
    const titleWidths = ["70%", "82%", "64%", "75%", "78%", "68%"];
    const summaryWidths = ["45%", "38%", "52%", "41%", "48%", "44%"];

    return `
      <div class="sk-list">
        ${Array.from({length: count}, (_, index) => `
          <div class="sk-list-row">
            <span class="sk sk-sm sk-list-date"></span>
            <span class="sk-list-copy">
              <span class="sk sk-line" style="inline-size:${titleWidths[index % titleWidths.length]}"></span>
              <span class="sk sk-sm" style="inline-size:${summaryWidths[index % summaryWidths.length]}"></span>
            </span>
            <span class="sk sk-chip sk-list-chip"></span>
          </div>
        `).join("")}
      </div>
    `;
  }
}
