import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { showcaseSeo } from "@app/data/showcase-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Provides the focused, interactive selected-work card deck at `/cards/showcase`.
 *
 * This route separates the pullable deck from the showcase index, which now remains
 * a browsable catalog. It uses the shared focused-route header and delegates all card
 * interaction to `showcase-card-deck`; the inherited page lifecycle applies the
 * showcase SEO metadata before the deck connects.
 *
 * Selector: `showcase-card-page`.
 */
@Route({ path: "/cards/showcase", ssr: true })
@Component({ selector: "showcase-card-page", shadow: false })
export class ShowcaseCardPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Reuses the selected-work catalog metadata for this alternate presentation. */
  get seo(): SEO {
    return toSEO(showcaseSeo);
  }

  /** Places the persistent card-route header above the full-height selected-work deck. */
  render(): string {
    return HTML`
      <main id="showcase-card-main">
        <card-page-header link-label="Showcase" link-href="/showcase"></card-page-header>
        <showcase-card-deck data-analytics-section="showcase_projects"></showcase-card-deck>
      </main>
    `;
  }
}
