import { BaseElement, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "app-header",
  shadow: false,
})
export class AppHeaderComponent extends BaseElement {
  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.updateScrolledState();
  }

  @WindowListener({ event: "scroll" })
  onScroll(): void {
    this.updateScrolledState();
  }

  private updateScrolledState(): void {
    this.querySelector<HTMLElement>("#site-nav")?.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  render(): string {
    return `
      <nav id="site-nav" aria-label="Primary navigation">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <a href="/" class="shrink-0 text-sm font-semibold tracking-[-0.02em] text-[var(--foreground-color)]">${portfolioContent.nav.logo}</a>
          <div class="flex items-center gap-4 sm:gap-6">
            <div class="flex items-center gap-4 sm:gap-6">
              ${portfolioContent.nav.links
                .map(
                  (link) => `
                    <a href="${link.href}" class="nav-link ${link.label === "Journey" || link.label === "Speaking" ? "nav-link-optional" : ""} ${link.label === "Pricing" ? "nav-link-pricing" : ""}">${link.label}</a>
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
