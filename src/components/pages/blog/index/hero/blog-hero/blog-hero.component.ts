import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {blogIndexContent} from "@app/data/blog-content.ts";

/**
 * Presents the editorial introduction for the blog index and owns its scroll motion.
 *
 * The component has no catalog dependency: its copy is stable, while the passive
 * scroll listener only transforms its own hero elements. Motion preference and
 * animation-frame cleanup stay inside this boundary.
 *
 * Selector: `blog-hero`.
 */
@Component({
  selector: "blog-hero",
  shadow: false,
})
export class BlogHeroComponent extends BaseElement {
  private motionPreference: MediaQueryList | null = null;
  private frameId: number | null = null;
  private reducedMotion = false;

  constructor() {
    super();
  }

  /** Starts the passive scroll and reduced-motion listeners after hero markup exists. */
  @OnEvent("connected", true)
  initializeHeroMotion(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.updateMotionPreference);
    window.addEventListener("scroll", this.scheduleScrollRender, {passive: true});
    this.scheduleScrollRender();
  }

  /** Removes listeners and cancels a pending frame when the hero leaves the document. */
  @OnEvent("disconnected", true)
  cleanupHeroMotion(): void {
    this.motionPreference?.removeEventListener("change", this.updateMotionPreference);
    window.removeEventListener("scroll", this.scheduleScrollRender);
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    this.motionPreference = null;
    this.frameId = null;
  }

  /** Re-renders the hero transform when the system motion preference changes. */
  private readonly updateMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.scheduleScrollRender();
  };

  /** Coalesces scroll layout work into one frame and updates the hero transform. */
  private readonly scheduleScrollRender = (): void => {
    if (this.frameId !== null) {
      return;
    }
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      const heroWrap = this.querySelector<HTMLElement>("[data-blog-hero-wrap]");
      const heroInner = this.querySelector<HTMLElement>("[data-blog-hero-inner]");
      const scrollHint = this.querySelector<HTMLElement>("scroll-hint");
      if (!heroWrap || !heroInner || this.reducedMotion) {
        return;
      }
      const travel = Math.max(1, heroWrap.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -heroWrap.getBoundingClientRect().top / travel));
      scrollHint?.setAttribute("progress", String(progress));
      heroInner.style.opacity = String(Math.max(0, 1 - progress * 1.4));
      heroInner.style.transform = `translate3d(0, ${progress * -40}px, 0) scale(${1 - progress * 0.1})`;
    });
  };

  /** Returns the static blog introduction markup. */
  render(): string {
    return `
      <div class="layout-hero-pin-wrap blog-hero-wrap" data-blog-hero-wrap>
        <section class="layout-hero-pin-stage blog-hero-stage" aria-labelledby="blog-title">
          <div class="blog-hero-inner" data-blog-hero-inner>
            <p class="blog-eyebrow">${blogIndexContent.hero.eyebrow}</p>
            <h1 id="blog-title" class="blog-display">${blogIndexContent.hero.titleBeforeAccent} <span>${blogIndexContent.hero.titleAccent}</span></h1>
            <p class="blog-hero-summary">${blogIndexContent.hero.summary}</p>
          </div>
          <scroll-hint mode="vertical" label="${blogIndexContent.hero.scrollHint}"></scroll-hint>
        </section>
      </div>
    `;
  }
}
