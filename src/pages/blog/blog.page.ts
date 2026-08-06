import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {getBlogSeo} from "@app/data/blog-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Blog index route at `/blog`.
 *
 * The page composes the blog index and shared footer; its SEO is adapted from
 * the blog data layer, so the route code contains no authored metadata literals.
 */
@Route({path: "/blog", ssr: true})
@Component({
  selector: "blog-page",
  shadow: false,
})
export class BlogPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Returns blog-index SEO authored by the blog data layer. */
  get seo(): SEO {
    return toSEO(getBlogSeo());
  }

  /** Renders the index route shell around the three blog landing sections. */
  render(): string {
    return `
      <app-header></app-header>
      <blog-index></blog-index>
      <app-footer></app-footer>
    `;
  }
}
