import {BaseElement, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";

/** Renders card-shaped placeholders for delayed project or featured data. */
@Component({
  selector: "sk-cards",
  shadow: false,
})
export class SkeletonCardsComponent extends BaseElement {
  /** Number of placeholder cards, clamped to a small responsive grid. */
  @Property({name: "n", type: String})
  count = "3";

  constructor() {
    super();
  }

  /** Mirrors an eyebrow, project title, description lines, and tag chips. */
  render(): string {
    const cardCount = Math.min(6, Math.max(1, Number.parseInt(this.count, 10) || 3));
    const eyebrowWidths = ["40%", "45%", "38%", "42%", "48%", "36%"];
    const titleWidths = ["65%", "55%", "70%", "62%", "58%", "68%"];
    const descriptionWidths = ["85%", "78%", "82%", "88%", "76%", "80%"];

    return `
      <div class="sk-cards">
        ${Array.from({length: cardCount}, (_, index) => `
          <div class="sk-card sk-stagger">
            <span class="sk sk-sm" style="inline-size:${eyebrowWidths[index % eyebrowWidths.length]}"></span>
            <span class="sk sk-line sk-card-title" style="inline-size:${titleWidths[index % titleWidths.length]}"></span>
            <span class="sk sk-sm" style="inline-size:100%"></span>
            <span class="sk sk-sm" style="inline-size:${descriptionWidths[index % descriptionWidths.length]}"></span>
            <span class="sk-card-chip-row">
              <span class="sk sk-chip sk-card-chip"></span>
              <span class="sk sk-chip sk-card-chip"></span>
            </span>
          </div>
        `).join("")}
      </div>
    `;
  }
}
