import {archivePageNumber} from "@app/utils/archive-page.utils.ts";
import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {newsNotes, getNewsNote, getNewsSeo, getNewsSlug, newsNotFoundSeo} from "@app/configs/news.config.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/** Resolves numbered archive pages and article permalinks sharing the /news/ path. */
@Route({path: "/news/:slug"})
@Component({selector: "news-slug-page", shadow: false})
export class NewsSlugPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Numbers outside the published archive continue through normal slug resolution. */
  private get archivePage(): number | undefined {
    return archivePageNumber(window.location.pathname, "news", newsNotes.length);
  }

  /** Gives each numbered archive a distinct document title for search and sharing. */
  get seo(): SEO {
    const page = this.archivePage;
    if (page) {
      const content = getNewsSeo();
      const title = `${content.title} · Page ${page}`;
      return toSEO({...content, title, ogTitle: title});
    }
    const slug = getNewsSlug(window.location.pathname);
    const note = getNewsNote(slug);
    return toSEO(note ? getNewsSeo(note) : newsNotFoundSeo);
  }

  render(): TemplateResult {
    return html`
      <app-header></app-header>
      ${this.archivePage ? html`<news-index></news-index>` : html`<news-article></news-article>`}
      <app-footer></app-footer>
    `;
  }
}
