import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { supportContent } from "@app/data/support-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Support route at `/support`.
 *
 * The shell sequences operational expectations, answers-first support, and
 * self-serve references before offering a separate project handoff. Copy and
 * SEO stay in `supportContent`; each child component owns one interaction or
 * presentation concern.
 * SEO is exposed through the `seo` getter for `DotaPageElement` to apply during
 * route initialization.
 */
@Route({ path: "/support" })
@Component({
  selector: "support-page",
  shadow: false,
})
export class SupportPage extends DotaPageElement {
  /** Initializes the route shell; composed sections own their interaction state. */
  constructor() {
    super();
  }

  /** Adapts the authored support metadata to the framework SEO contract. */
  get seo(): SEO {
    return toSEO(supportContent.seo);
  }

  /** Renders the full support journey, its separate project handoff, and the shared footer. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main id="support-page-main">
        <support-overview></support-overview>
        <support-section></support-section>
        <support-next-steps></support-next-steps>
        <support-faq></support-faq>
        <support-resources></support-resources>
        <support-start-project></support-start-project>
      </main>
      <app-footer></app-footer>
    `;
  }
}
