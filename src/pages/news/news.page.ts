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
      <app-notice
        container="content"
        offset="header"
        label="Test content"
        message="The Dispatch is a temporary preview. Its entries are illustrative and should not be treated as published project or operational records."
      ></app-notice>
      <news-index></news-index>
      <app-footer></app-footer>
    `;
  }
}
