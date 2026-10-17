import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import {BaseElement, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {getBlogPath, getBlogPost, getRelatedBlogPosts, labelForCategory} from "@app/configs/blogs.config.ts";
import {blogArticleContent, blogIndexContent} from "@app/data/blog-content.ts";

/**
 * Lists the posts most related to the article being read.
 *
 * Used by `blog-article` after the article body and share controls. The parent
 * passes the route slug; this element resolves the catalog record and asks
 * `getRelatedBlogPosts()` for 2–4 posts ranked by shared catalog tags. The
 * selection is pure catalog data, so SSG renders the same links that the client
 * hydrates and crawlers see them in the static HTML. Unknown slugs, or a catalog
 * with no related posts, render nothing.
 *
 * Selector: `blog-related-posts`.
 */
@Component({
  selector: "blog-related-posts",
  shadow: false,
})
export class BlogRelatedPostsComponent extends BaseElement {
  /** Catalog slug of the current article. Attribute `slug`; an unknown slug renders nothing. */
  @Property({name: "slug", type: String})
  slug = "";

  /** Creates the static related-posts element. */
  constructor() {
    super();
  }

  /** Renders one link per related post with its category and reading time. */
  render(): TemplateResult {
    const post = getBlogPost(this.slug);
    const related = post ? getRelatedBlogPosts(post) : [];
    if (related.length === 0) {
      return html``;
    }

    const items = related.map((item) => html`
      <li>
        <a class="blog-related-link" href="${getBlogPath(item.slug)}">
          <span class="blog-related-meta"
            >${labelForCategory(item.category)} · ${item.minutes}
            ${blogIndexContent.readTimeSuffix}</span
          >
          <span class="blog-related-heading">${item.header}</span>
        </a>
      </li>
    `);

    return html`
      <section
        class="blog-related"
        aria-labelledby="blog-related-title"
        data-analytics-section="blog_article_related"
      >
        <h2 id="blog-related-title" class="blog-related-title">${blogArticleContent.related.title}</h2>
        <ul class="blog-related-list">
          ${items}
        </ul>
      </section>
    `;
  }
}
