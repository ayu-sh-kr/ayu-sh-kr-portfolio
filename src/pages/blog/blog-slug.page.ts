import {archivePageNumber} from "@app/utils/archive-page.utils.ts";
import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {blogPosts, getBlogPost, getBlogSlug} from "@app/configs/blogs.config.ts";
import {blogNotFoundSeo, getBlogSeo} from "@app/data/blog-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/** Resolves numbered archive pages and article permalinks sharing the /blog/ path. */
@Route({path: "/blog/:slug"})
@Component({
  selector: "blog-slug-page",
  shadow: false,
})
export class BlogSlugPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Numbers outside the published archive continue through normal slug resolution. */
  private get archivePage(): number | undefined {
    return archivePageNumber(window.location.pathname, "blog", blogPosts.length);
  }

  /** Gives each numbered archive a distinct document title for search and sharing. */
  get seo(): SEO {
    const page = this.archivePage;
    if (page) {
      const content = getBlogSeo();
      const title = `${content.title} · Page ${page}`;
      return toSEO({...content, title, ogTitle: title});
    }
    const post = getBlogPost(getBlogSlug(window.location.pathname));

    return toSEO(post ? getBlogSeo(post) : blogNotFoundSeo);
  }

  render(): TemplateResult {
    return html`
      <app-header></app-header>
      ${this.archivePage ? html`<blog-index></blog-index>` : html`<blog-article data-analytics-section="blog_article"></blog-article>`}
      <app-footer></app-footer>
    `;
  }
}
