import { BaseElement, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { portfolioContent } from "@app/data/portfolio-content.ts";

const SCROLLED_NAV_THRESHOLD = 40;

@Component({
  selector: "app-header",
  shadow: false,
})
export class AppHeaderComponent extends BaseElement {
  constructor() {
    super();
  }

  @OnEvent("connected", true)
  initializeScrolledState(): void {
    this.updateScrolledState();
  }

  @WindowListener({ event: "scroll" })
  updateScrolledState(): void {
    this.querySelector<HTMLElement>("#site-nav")?.classList.toggle(
      "is-scrolled",
      window.scrollY > SCROLLED_NAV_THRESHOLD,
    );
  }

  render(): string {
    const { nav } = portfolioContent;

    return `
      <nav id="site-nav" aria-label="Primary navigation">
        <div class="mx-auto flex max-w-[var(--layout-page-max)] items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <a href="/" class="shrink-0 text-sm font-semibold tracking-[-0.02em] text-[var(--foreground-color)]">${nav.logo}</a>
          <div class="flex items-center gap-4 sm:gap-6">
            <div class="app-header-desktop-links flex items-center gap-4 sm:gap-6">
              ${nav.links
                .map(
                  (link) => `
                    <a href="${link.href}" class="nav-link ${link.label === "Journey" || link.label === "Speaking" ? "nav-link-optional" : ""} ${link.label === "Pricing" ? "nav-link-pricing" : ""}">${link.label}</a>
                  `,
                )
                .join("")}
            </div>
            <dota-popover
              class="app-header-mobile-popover"
              anchored-selector="#mobile-nav-panel"
              placement="bottom-end"
              offset="12"
            >
              <button class="app-header-menu-button" type="button" aria-label="Open navigation">
                <dota-icon
                  name="material-symbols:menu-rounded"
                  size="xl"
                  color="none"
                  variant="link"
                ></dota-icon>
              </button>
              <div id="mobile-nav-panel" class="app-header-mobile-panel" aria-label="Mobile navigation">
                ${nav.links
                  .map(
                    (link) => `
                      <a href="${link.href}" class="nav-link mobile-nav-link">${link.label}</a>
                    `,
                  )
                  .join("")}
              </div>
            </dota-popover>
            <dark-mode-button></dark-mode-button>
          </div>
        </div>
      </nav>
    `;
  }
}
