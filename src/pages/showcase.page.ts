import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import {showcaseSeo} from "@app/data/showcase-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Showcase index route at `/showcase`.
 *
 * The page composes the project sections and adapts the catalog's index SEO;
 * project-specific content remains owned by showcase data and child elements.
 */
@Route({ path: "/showcase" })
@Component({
  selector: "showcase-page",
  shadow: false,
})
export class ShowcasePage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Returns showcase-index SEO authored in `showcaseSeo`. */
  get seo(): SEO {
    return toSEO(showcaseSeo);
  }

  /** Renders the showcase content shell between the shared header and footer. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <showcase-page-content></showcase-page-content>
      <app-footer></app-footer>
    `;
  }
}
