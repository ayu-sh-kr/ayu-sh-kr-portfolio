import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { reachOutContent } from "@app/data/reach-out-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Client-facing introduction route for direct project conversations.
 *
 * The route uses its focused header and deck rather than the full navigation,
 * while both surfaces still share the application brand and layout contract.
 */
@Route({ path: "/cards/reach-out", ssr: true })
@Component({ selector: "reach-out-page", shadow: false })
export class ReachOutPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Supplies share metadata for the direct client-facing route. */
  get seo(): SEO {
    return toSEO(reachOutContent.seo);
  }

  /** Composes the page header and independent interactive deck in reading order. */
  render(): string {
    return HTML`
      <main id="reach-out-main">
        <reach-out-header></reach-out-header>
        <reach-out-card-deck></reach-out-card-deck>
      </main>
    `;
  }
}
