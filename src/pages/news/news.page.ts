import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {getNewsSeo} from "@app/configs/news.config.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Public Dispatch catalogue at `/news`.
 * The route owns metadata and shared chrome while `news-index` owns the feed,
 * filtering, and demo-derived editorial presentation.
 */
@Route({path: "/news", ssr: true})
@Component({selector: "news-page", shadow: false})
export class NewsPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    return toSEO(getNewsSeo());
  }

  render(): string {
    return `
      <app-header></app-header>
      <news-test-notice></news-test-notice>
      <news-index></news-index>
      <app-footer></app-footer>
    `;
  }
}
