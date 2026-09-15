import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {getNewsNote, getNewsSeo, getNewsSlug, newsNotFoundSeo} from "@app/configs/news.config.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Dynamic Dispatch permalink at `/news/:slug`.
 * It resolves only route SEO and delegates loading and reading behavior to the
 * feature component, matching the established blog detail boundary.
 */
@Route({path: "/news/:slug"})
@Component({selector: "news-slug-page", shadow: false})
export class NewsSlugPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    const slug = getNewsSlug(window.location.pathname);
    const note = getNewsNote(slug);
    return toSEO(note ? getNewsSeo(note) : newsNotFoundSeo);
  }

  render(): string {
    return `
      <app-header></app-header>
      <app-notice
        container="content"
        offset="header"
        label="Test content"
        message="The Dispatch is a temporary preview. Its entries are illustrative and should not be treated as published project or operational records."
      ></app-notice>
      <news-article></news-article>
      <app-footer></app-footer>
    `;
  }
}
