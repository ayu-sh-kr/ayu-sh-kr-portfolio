import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "app-header",
  shadow: false,
})
export class AppHeaderComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return `
      <nav id="site-nav" aria-label="Primary navigation">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <a href="#hero-wrap" class="shrink-0 text-sm font-semibold tracking-[-0.02em] text-[var(--foreground-color)]">${portfolioContent.nav.logo}</a>
          <div class="flex items-center gap-4 sm:gap-6">
            <div class="flex items-center gap-4 sm:gap-6">
              ${portfolioContent.nav.links
                .map(
                  (link, index) => `
                    <a href="${link.href}" class="nav-link ${index === 1 || index === 2 ? "nav-link-optional" : ""}">${link.label}</a>
                  `,
                )
                .join("")}
            </div>
            <dark-mode-button></dark-mode-button>
          </div>
        </div>
      </nav>
    `;
  }
}
