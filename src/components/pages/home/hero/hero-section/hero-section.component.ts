import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "portfolio-hero",
  shadow: false,
})
export class PortfolioHeroComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const { hero } = portfolioContent;

    return HTML`
      <div id="hero-wrap" class="pin-wrap hero-pin-wrap">
        <section class="pin-stage hero-stage" aria-labelledby="hero-title">
          <div id="hero-inner" class="layout-content layout-stack layout-stack-lg text-center">
            <p class="motion-eyebrow">${hero.eyebrow}</p>
            <h1 id="hero-title" class="motion-display layout-center">
              ${hero.titleBeforeAccent} <span class="text-(--primary-color)">${hero.accent}</span>
            </h1>
            <p class="layout-center layout-measure text-[length:var(--type-lede-size)] leading-[var(--type-lede-leading)] text-(--muted-color)">${hero.summary}</p>
            <div class="layout-row layout-row-tight justify-center">
              <a class="app-link app-link--button app-link--ink" href="${hero.primaryCta.href}">${hero.primaryCta.label}</a>
              <a class="app-link app-link--button app-link--ghost" href="${hero.secondaryCta.href}">${hero.secondaryCta.label}</a>
            </div>
          </div>
          <scroll-hint></scroll-hint>
        </section>
      </div>
    `;
  }
}
