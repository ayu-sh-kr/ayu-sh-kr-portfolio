import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";

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
  render(): TemplateResult {
    const stack = this.stack.split("|").map((item) => item.trim()).filter(Boolean);

    return html`
      <header class="showcase-article-header">
        <div class="showcase-article-meta">
          <span class="showcase-chip">${this.kind}</span>
          <span class="showcase-chip showcase-chip-muted">${this.year}</span>
          <span class="showcase-chip showcase-chip-muted">${this.status}</span>
        </div>
        <h1>${this.title}</h1>
        <p class="showcase-article-tagline">${this.tagline}</p>
        <div class="showcase-chip-row" aria-label="Technology stack">
          ${stack.map((item) => html`<span class="showcase-chip showcase-chip-muted">${item}</span>`)}
        </div>
      </header>
    `;
  }
}
