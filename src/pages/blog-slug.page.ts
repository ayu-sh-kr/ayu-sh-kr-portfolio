import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {getBlogPost, getBlogSlug} from "@app/configs/blogs.config.ts";
import {blogNotFoundSeo, getBlogSeo} from "@app/data/blog-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Dynamic blog article route at `/blog/:slug`.
 *
 * The article component owns slug resolution, Markdown loading, article states,
 * and the event published to its Markdown child. The index route has no part in
 * this flow, which keeps landing-page filtering separate from article reading.
 */
@Route({path: "/blog/:slug"})
@Component({
  selector: "blog-slug-page",
  shadow: false,
})
export class BlogSlugPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Returns article or not-found SEO derived from the current blog record. */
  get seo(): SEO {
    const post = getBlogPost(getBlogSlug(window.location.pathname));

    return toSEO(post ? getBlogSeo(post) : blogNotFoundSeo);
  }

  /** Renders only the article surface between the shared header and footer. */
  render(): string {
    return `
      <app-header></app-header>
      <blog-article></blog-article>
      <app-footer></app-footer>
    `;
  }
}
