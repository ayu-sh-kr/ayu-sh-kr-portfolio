import { BaseElement, Component, HTML, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

@Component({
  selector: "pricing-hero",
  shadow: false,
})
export class PricingHeroComponent extends BaseElement {
  private heroWrap: HTMLElement | null = null;
  private heroInner: HTMLElement | null = null;

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.heroWrap = this.querySelector<HTMLElement>("#pricing-hero-wrap");
    this.heroInner = this.querySelector<HTMLElement>("#pricing-hero-inner");
    this.renderHeroMotion();
  }

  @WindowListener({ event: "scroll" })
  onScroll(): void {
    this.renderHeroMotion();
  }

  @WindowListener({ event: "resize" })
  onResize(): void {
    this.renderHeroMotion();
  }

  private renderHeroMotion(): void {
    if (!this.heroWrap || !this.heroInner) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.heroInner.style.opacity = "1";
      this.heroInner.style.transform = "none";
      return;
    }

    const bounds = this.heroWrap.getBoundingClientRect();
    const travel = Math.max(1, bounds.height - window.innerHeight);
    const progress = clamp(-bounds.top / travel, 0, 1);
    this.heroInner.style.opacity = String(clamp(1 - progress * 1.4, 0, 1));
    this.heroInner.style.transform = `scale(${1 - progress * 0.1}) translate3d(0, ${progress * -30}px, 0)`;
  }

  render(): string {
    const content = pricingContent.hero;

    return HTML`
      <div id="pricing-hero-wrap">
        <section id="pricing-hero-stage" aria-labelledby="pricing-hero-title">
          <div id="pricing-hero-inner">
            <p class="pricing-eyebrow">${content.eyebrow}</p>
            <h1 id="pricing-hero-title" class="pricing-display mt-5">
              ${content.titleBeforeBreak}<br />${content.titleAfterBreak} <span>${content.titleAccent}</span>
            </h1>
            <p class="pricing-lede mx-auto mt-6 max-w-2xl">${content.body}</p>
            <div class="mt-9 flex flex-wrap justify-center gap-3">
              <a class="pricing-accent-button" href="${content.primaryHref}">${content.primaryCta}</a>
              <a class="pricing-ghost-button" href="${content.secondaryHref}">${content.secondaryCta}</a>
            </div>
            <p class="pricing-trust mt-6">${content.trust}</p>
          </div>
          <p class="pricing-scroll-hint" aria-hidden="true">${content.scrollLabel}</p>
        </section>
      </div>
    `;
  }
}
