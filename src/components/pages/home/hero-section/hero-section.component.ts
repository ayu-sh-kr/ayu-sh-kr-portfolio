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
          <div id="hero-inner" class="mx-auto max-w-5xl px-5 text-center sm:px-8">
            <p class="motion-eyebrow">${hero.eyebrow}</p>
            <h1 id="hero-title" class="motion-display mx-auto mt-5">
              ${hero.titleBeforeAccent} <span class="text-(--primary-color)">${hero.accent}</span>
            </h1>
            <p class="mx-auto mt-7 max-w-2xl text-[1.06rem] leading-8 text-(--muted-color) sm:text-xl">${hero.summary}</p>
            <div class="mt-10 flex flex-wrap justify-center gap-3">
              <a class="motion-button motion-button-ink" href="${hero.primaryCta.href}">${hero.primaryCta.label}</a>
              <a class="motion-button motion-button-ghost" href="${hero.secondaryCta.href}">${hero.secondaryCta.label}</a>
            </div>
          </div>
          <p class="scroll-hint" aria-hidden="true">Scroll</p>
        </section>
      </div>
    `;
  }
}
