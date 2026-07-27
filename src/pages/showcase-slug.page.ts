import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {getShowcaseProject, getShowcaseSeo, getShowcaseSlug} from "@app/data/showcase-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Dynamic showcase route at `/showcase/:slug`.
 *
 * The selected catalog project supplies article title and summary; unknown
 * slugs receive the data-layer fallback SEO.
 */
@Route({path: "/showcase/:slug"})
@Component({
  selector: "showcase-slug-page",
  shadow: false,
})
export class ShowcaseSlugPage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Returns article or not-found SEO derived from the current showcase record. */
  get seo(): SEO {
    const project = getShowcaseProject(getShowcaseSlug(window.location.pathname));

    return toSEO(getShowcaseSeo(project));
  }

  /** Renders the showcase article shell; the child view loads the selected project. */
  render(): string {
    return `
      <app-header></app-header>
      <showcase-view data-analytics-section="showcase_article"></showcase-view>
      <app-footer></app-footer>
    `;
  }
}
