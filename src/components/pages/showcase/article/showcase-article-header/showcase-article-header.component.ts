import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { escapeHtml } from "@app/utils/html.utils.ts";

/** Renders the metadata and title that introduce a showcase case study. */
@Component({
  selector: "showcase-article-header",
  shadow: false,
})
export class ShowcaseArticleHeaderComponent extends BaseElement {
  /** Project category shown in the metadata row. */
  @Property({ name: "kind", type: String })
  kind = "";

  /** Project year shown in the metadata row. */
  @Property({ name: "year", type: String })
  year = "";

  /** Human-readable project status. */
  @Property({ name: "status", type: String })
  status = "";

  /** Project title. */
  @Property({ name: "title", type: String })
  title = "";

  /** Project summary shown below the title. */
  @Property({ name: "tagline", type: String })
  tagline = "";

  /** Pipe-separated technology labels supplied by the route controller. */
  @Property({ name: "stack", type: String })
  stack = "";

  /** Creates the static showcase-header element. */
  constructor() {
    super();
  }

  /** Renders article metadata, title, summary, and technology labels. */
  render(): string {
    const stack = this.stack.split("|").map((item) => item.trim()).filter(Boolean);

    return HTML`
      <header class="showcase-article-header">
        <div class="showcase-article-meta">
          <span class="showcase-chip">${escapeHtml(this.kind)}</span>
          <span class="showcase-chip showcase-chip-muted">${escapeHtml(this.year)}</span>
          <span class="showcase-chip showcase-chip-muted">${escapeHtml(this.status)}</span>
        </div>
        <h1>${escapeHtml(this.title)}</h1>
        <p class="showcase-article-tagline">${escapeHtml(this.tagline)}</p>
        <div class="showcase-chip-row" aria-label="Technology stack">
          ${stack.map((item) => HTML`<span class="showcase-chip showcase-chip-muted">${escapeHtml(item)}</span>`).join("")}
        </div>
      </header>
    `;
  }
}
