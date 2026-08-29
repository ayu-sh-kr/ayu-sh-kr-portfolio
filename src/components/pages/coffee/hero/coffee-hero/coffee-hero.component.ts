import { BaseElement, Component, HTML, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";

/** Bounds scroll progress to the range used by the coffee hero transform. */
const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));

/**
 * Pinned opening for the coffee route with a small scroll-driven exit.
 *
 * It owns only the hero presentation: after connection it reads its own bounds
 * on scroll or resize and fades/scales the inner copy. Motion-preference users
 * retain the same content in a static, accessible layout.
 *
 * Selector: `coffee-hero`.
 */
@Component({
  selector: "coffee-hero",
  shadow: false,
})
export class CoffeeHeroComponent extends BaseElement {
  private heroWrap: HTMLElement | null = null;
  private heroInner: HTMLElement | null = null;
  private motionPreference: MediaQueryList | null = null;

  /** Creates the component before its rendered nodes are available. */
  constructor() {
    super();
  }

  /** Captures the animated nodes and applies the correct initial scroll state. */
  @OnEvent("connected", true)
  initializeHeroMotion(): void {
    this.heroWrap = this.querySelector<HTMLElement>("#coffee-hero-wrap");
    this.heroInner = this.querySelector<HTMLElement>("#coffee-hero-inner");
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.renderHeroMotion();
  }

  /** Releases references so a disconnected route cannot retain its rendered hero. */
  @OnEvent("disconnected", true)
  cleanupHeroMotion(): void {
    this.heroWrap = null;
    this.heroInner = null;
    this.motionPreference = null;
  }

  /**
   * Recalculates the hero fade and scale after scrolling or resizing.
   *
   * Motion-preference users skip straight to the static state; otherwise the
   * progress is how far the pinned wrapper has scrolled past the viewport.
   */
  @WindowListener({ event: ["scroll", "resize"] })
  renderHeroMotion(): void {
    if (!this.heroWrap || !this.heroInner) {
      return;
    }

    if (this.motionPreference?.matches) {
      this.heroInner.style.opacity = "1";
      this.heroInner.style.transform = "none";
      return;
    }

    const bounds = this.heroWrap.getBoundingClientRect();
    const progress = clamp(-bounds.top / Math.max(1, bounds.height - window.innerHeight), 0, 1);
    this.heroInner.style.opacity = String(clamp(1 - progress * 1.4, 0, 1));
    this.heroInner.style.transform = `scale(${1 - progress * 0.1}) translate3d(0, ${progress * -30}px, 0)`;
  }

  /** Returns the compact introduction and direct links into its two named sections. */
  render(): string {
    const content = coffeeContent.hero;

    return HTML`
      <div id="coffee-hero-wrap" class="layout-hero-pin-wrap layout-hero-pin-wrap--long">
        <section id="coffee-hero-stage" class="layout-hero-pin-stage" aria-labelledby="coffee-hero-title">
          <div id="coffee-hero-inner">
            <p class="coffee-eyebrow">${content.eyebrow}</p>
            <h1 id="coffee-hero-title" class="type-display coffee-hero-title mt-5">
              ${content.titleBeforeAccent} <span>${content.titleAccent}</span> ${content.titleAfterAccent}
            </h1>
            <p class="type-lede coffee-hero-lede mx-auto mt-6">${content.body}</p>
            <div class="mt-9 flex flex-wrap justify-center gap-3">
              <a class="app-link app-link--button app-link--accent" href="#coffee-order">${content.primaryCta}</a>
              <a class="app-link app-link--button app-link--ghost" href="#coffee-impact">${content.secondaryCta}</a>
            </div>
            <p class="coffee-hero-trust mt-6">${content.trust}</p>
          </div>
          <span class="coffee-scroll-hint" aria-hidden="true">Scroll</span>
        </section>
      </div>
    `;
  }
}
