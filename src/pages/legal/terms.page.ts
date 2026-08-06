import {Component, DotaPageElement, HTML, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {termsSeo} from "@app/data/legal-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Terms route at `/legal/terms`.
 *
 * The document view owns terms loading and rendering; this page only composes
 * the shell and adapts the legal data's SEO content.
 */
@Route({path: "/legal/terms", ssr: true})
@Component({
  selector: "terms-page",
  shadow: false,
})
export class TermsPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Returns terms SEO authored in `termsSeo`. */
  get seo(): SEO {
    return toSEO(termsSeo);
  }

  /** Renders the shared header, terms view, and footer shell. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <terms-view data-analytics-section="terms_document"></terms-view>
      <app-footer></app-footer>
    `;
  }
}
