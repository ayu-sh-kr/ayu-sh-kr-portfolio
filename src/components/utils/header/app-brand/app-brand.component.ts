import { BaseElement, Component, HTML, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";
import { GeneralUtils } from "@app/utils/general.utils.ts";

/**
 * Renders the shared home link and theme-aware portfolio mark.
 *
 * Page headers use this component whenever they need the application identity
 * without inheriting navigation controls. It refreshes when the document theme
 * changes so every use keeps the correct light or dark mark asset.
 *
 * Selector: `app-brand`.
 */
@Component({ selector: "app-brand", shadow: false })
export class AppBrandComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Refreshes the mark asset after any control changes the document theme. */
  @WindowListener({ event: "themeChange" })
  refreshThemeMark(): void {
    this.updateHTML();
  }

  /** Renders the portfolio identity as a home link using the active theme's mark asset. */
  render(): string {
    const mark = GeneralUtils.isDarkMode() ? "mark-dark" : "mark-light";

    return HTML`
      <a href="/" class="app-link app-brand" aria-label="${portfolioContent.nav.logo}, home">
        <img class="app-brand__mark" src="/icons/svg/${mark}.svg" alt="" aria-hidden="true" />
        <span>${portfolioContent.nav.logo}</span>
      </a>
    `;
  }
}
