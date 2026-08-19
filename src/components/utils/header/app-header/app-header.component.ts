import { BaseElement, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { portfolioContent } from "@app/data/portfolio-content.ts";
import { GeneralUtils } from "@app/utils/general.utils.ts";

const SCROLLED_NAV_THRESHOLD = 40;

/**
 * Renders the site-wide navigation and keeps its chrome in sync with page state.
 *
 * The header is shared by the portfolio routes. Scroll updates only the nav's
 * scrolled class, while a `themeChange` event re-renders the brand mark so the
 * asset matches the current class-based theme.
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
   * Re-renders the header after the application theme changes.
   *
   * The mark path is derived in `render()` from the document's current dark
   * mode, which keeps this component correct even when another control toggles
   * the theme.
   */
  @WindowListener({ event: "themeChange" })
  handleThemeChange(): void {
    this.updateHTML();
  }

  /**
   * Builds the desktop and mobile navigation from authored portfolio content.
   *
   * The result includes the theme-specific brand asset and shared link data;
   * event handlers then add scroll state or refresh this complete structure only
   * when those external inputs change.
   */
  render(): string {
    const { nav } = portfolioContent;
    const mark = GeneralUtils.isDarkMode() ? "mark-dark" : "mark-light";

    return `
      <nav id="site-nav" aria-label="Primary navigation">
        <div class="app-header-inner layout-page layout-row layout-row-split">
          <a href="/" class="app-link app-header-brand">
            <img class="app-header-brand-mark" src="/icons/svg/${mark}.svg" alt="" aria-hidden="true" />
            <span>${nav.logo}</span>
          </a>
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
