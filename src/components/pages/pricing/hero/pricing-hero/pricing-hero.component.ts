import { BaseElement, Component, HTML, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";

/** Keeps hero scroll progress inside the range used by its visual transforms. */
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Renders the pricing page hero and synchronizes its scroll-driven presentation.
 *
 * After connection, it captures the rendered hero nodes and applies the same
 * motion calculation for scroll and resize events. Reduced-motion users receive
 * an opaque, untransformed hero instead of the animated state.
 *
 * Selector: `pricing-hero`.
 */
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

  /** Captures hero nodes and applies the initial motion state after rendering. */
  @OnEvent("connected", true)
  initializeHeroMotion(): void {
    this.heroWrap = this.querySelector<HTMLElement>("#pricing-hero-wrap");
    this.heroInner = this.querySelector<HTMLElement>("#pricing-hero-inner");
    this.renderHeroMotion();
  }

  /** Recalculates the hero transform for scroll and viewport-size changes. */
  @WindowListener({ event: ["scroll", "resize"] })
  renderHeroMotion(): void {
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
    this.querySelector<HTMLElement>("scroll-hint")?.setAttribute("progress", String(progress));
    this.heroInner.style.opacity = String(clamp(1 - progress * 1.4, 0, 1));
    this.heroInner.style.transform = `scale(${1 - progress * 0.1}) translate3d(0, ${progress * -30}px, 0)`;
  }

  /** Returns the pricing hero content and its motion-controller anchor elements. */
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
          <scroll-hint mode="vertical" label="${content.scrollLabel}"></scroll-hint>
        </section>
      </div>
    `;
  }
}
