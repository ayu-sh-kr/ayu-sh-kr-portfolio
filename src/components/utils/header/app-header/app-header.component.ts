import { BaseElement, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { portfolioContent } from "@app/data/portfolio-content.ts";

const SCROLLED_NAV_THRESHOLD = 40;

/**
 * Renders the site-wide navigation and keeps its chrome in sync with page state.
 *
 * The header is shared by the portfolio routes. Scroll updates only the nav's
 * scrolled class; `app-brand` owns the theme-aware mark used here and by the
 * focused page headers that do not need full navigation.
 *
 * Selector: `app-header`.
 */
@Component({
  selector: "app-header",
  shadow: false,
})
export class AppHeaderComponent extends BaseElement {
  constructor() {
    super();
  }

  /**
   * Applies the initial scroll state after the connected element has rendered.
   *
   * The scroll listener only observes future window changes, so this first
   * synchronization prevents a header mounted below the top of the document
   * from appearing unscrolled until the visitor moves the page.
   */
  @OnEvent("connected", true)
  initializeScrolledState(): void {
    this.updateScrolledState();
  }

  /**
   * Toggles the compact nav treatment from the current window position.
   *
   * It mutates only the existing nav class; rendering is intentionally avoided
   * here so scrolling cannot recreate links, the popover, or the theme control.
   */
  @WindowListener({ event: "scroll" })
  updateScrolledState(): void {
    this.querySelector<HTMLElement>("#site-nav")?.classList.toggle(
      "is-scrolled",
      window.scrollY > SCROLLED_NAV_THRESHOLD,
    );
  }

  /**
   * Builds the desktop and mobile navigation from authored portfolio content.
   *
   * Navigation links remain authored in portfolio content, while `app-brand`
   * supplies the shared identity and owns its theme-specific asset selection.
   */
  render(): string {
    const { nav } = portfolioContent;
    return `
      <nav id="site-nav" aria-label="Primary navigation">
        <div class="app-header-inner layout-page layout-row layout-row-split">
          <app-brand></app-brand>
          <div class="app-header-actions layout-row">
            <div class="app-header-desktop-links layout-row layout-row-loose">
              ${nav.links
                .map(
                  (link) => `
                    <a href="${link.href}" class="app-link app-link--nav ${link.label === "Pricing" ? "app-header-nav-pricing" : ""}">${link.label}</a>
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
                      <a href="${link.href}" class="app-link app-link--nav app-link--nav-mobile">${link.label}</a>
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
