import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { blogArticleContent } from "@app/data/blog-content.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

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
  render(): string {
    return HTML`
      <header class="blog-article-header">
        <div class="blog-meta-row blog-article-meta">
          <span class="blog-chip">${escapeHtml(this.category)}</span>
          <span>${escapeHtml(this.metadata)}</span>
        </div>
        <h1>${escapeHtml(this.title)}</h1>
        <p class="blog-article-author">${blogArticleContent.authorPrefix} ${escapeHtml(this.writer)}</p>
      </header>
    `;
  }
}
