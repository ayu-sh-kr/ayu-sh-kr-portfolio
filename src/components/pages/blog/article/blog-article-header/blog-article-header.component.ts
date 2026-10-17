import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { blogArticleContent } from "@app/data/blog-content.ts";

/** Renders the metadata and title that introduce a loaded blog article. */
@Component({
  selector: "blog-article-header",
  shadow: false,
})
export class BlogArticleHeaderComponent extends BaseElement {
  /** Category label rendered in the article metadata row. */
  @Property({ name: "category", type: String })
  category = "";

  /** Combined reading-time and publication-date metadata. */
  @Property({ name: "metadata", type: String })
  metadata = "";

  /** Authored article title. */
  @Property({ name: "title", type: String })
  title = "";

  /** Authored writer name. */
  @Property({ name: "writer", type: String })
  writer = "";

  /** Creates the static article-header element. */
  constructor() {
    super();
  }

  /** Renders the semantic article header from route-owned article metadata. */
  render(): TemplateResult {
    return html`
      <header class="blog-article-header">
        <div class="blog-meta-row blog-article-meta">
          <span class="blog-chip">${this.category}</span>
          <span>${this.metadata}</span>
        </div>
        <h1>${this.title}</h1>
        <p class="blog-article-author">${blogArticleContent.authorPrefix} ${this.writer}</p>
      </header>
    `;
  }
}
