import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { portfolioContent } from "@app/data/portfolio-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Keeps Ayush's working perspective separate from the site-navigation shell.
 *
 * The focused card route reuses the shared deck behavior so it is read as a
 * short, direct sequence rather than as another section on the home page.
 */
@Route({ path: "/card/about-me", ssr: true })
@Component({ selector: "about-me-card-page", shadow: false })
export class AboutMeCardPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    return toSEO({ ...portfolioContent.seo, title: "About — Ayush Kumar Jaiswal" });
  }

  render(): string {
    return HTML`
      <main id="about-me-main">
        <card-page-header link-label="See the work" link-href="/showcase"></card-page-header>
        <about-me-card-deck></about-me-card-deck>
      </main>
    `;
  }
}
