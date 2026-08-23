import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {html} from "@ayu-sh-kr/dota-wrap/rendering";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {privacySeo} from "@app/data/legal-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Privacy policy route at `/legal/privacy`.
 *
 * The document view owns policy loading and rendering; this page only composes
 * the shell and adapts the legal data's SEO content.
 */
@Route({path: "/legal/privacy", ssr: true})
@Component({
  selector: "privacy-page",
  shadow: false,
})
export class PrivacyPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Returns privacy SEO authored in `privacySeo`. */
  get seo(): SEO {
    return toSEO(privacySeo);
  }

  /** Renders the shared header, policy view, and footer shell. */
  render() {
    return html`
      <app-header></app-header>
      <privacy-view data-analytics-section="privacy_document"></privacy-view>
      <app-footer></app-footer>
    `;
  }
}
