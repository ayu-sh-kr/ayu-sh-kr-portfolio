import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import {portfolioContent} from "@app/data/portfolio-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Portfolio landing page routed at `/`.
 *
 * The shell composes the home sections, while title, description, keywords,
 * and social metadata come from `portfolioContent.seo`.
 */
@Route({ path: "/" })
@Component({
  selector: "app-home",
  shadow: false,
})
export class HomePage extends DotaPageElement {
  constructor() {
    super();
  }

  /** Returns home-page SEO authored in `portfolioContent.seo`. */
  get seo(): SEO {
    return toSEO(portfolioContent.seo);
  }

  /** Renders the home shell and its composed sections. */
  render(): string {
    return HTML`
      <app-header></app-header>
      <main>
        <portfolio-hero></portfolio-hero>
        <portfolio-journey></portfolio-journey>
        <portfolio-work></portfolio-work>
        <portfolio-speaking></portfolio-speaking>
        <portfolio-skills></portfolio-skills>
        <portfolio-services></portfolio-services>
        <portfolio-contact></portfolio-contact>
        <portfolio-motion-controller></portfolio-motion-controller>
      </main>
      <app-footer></app-footer>
    `;
  }
}
