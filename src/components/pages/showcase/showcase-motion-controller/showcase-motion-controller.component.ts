import { BaseElement, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";

/** Constrains a progress value to the interval used by motion calculations. */
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Coordinates scroll-driven showcase motion and reveal animations.
 *
 * The component is behavior-only: it renders no markup and queries the page
 * elements emitted by `showcase-page-content`. Scroll and resize work is batched
 * into one animation frame, while the reduced-motion preference disables
 * transforms and immediately reveals content. All external resources are
 * released when the controller disconnects.
 *
 * Selector: `showcase-motion-controller`.
 */
@Component({
  selector: "showcase-motion-controller",
  shadow: false,
})
export class ShowcaseMotionControllerComponent extends BaseElement {
  /** Prevents duplicate animation-frame scheduling during a burst of events. */
  private ticking = false;
  /** Pending frame used to render all showcase motion styles. */
  private frameId: number | null = null;
  /** Observer that adds reveal classes as authored elements enter the viewport. */
  private revealObserver: IntersectionObserver | null = null;
  /** Media query used to react when the user's motion preference changes. */
  private motionPreference: MediaQueryList | null = null;
  /** Whether transforms should be skipped for accessibility and comfort. */
  private reducedMotion = false;

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  /** Initializes motion preference tracking, reveals, and the first frame. */
  initializeMotion(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.handleMotionPreference);
    this.observeRevealElements();
    this.scheduleMotionFrame();
  }

  @OnEvent("disconnected", true)
  /** Removes the media-query observer, reveal observer, and pending frame. */
  cleanupMotion(): void {
    this.motionPreference?.removeEventListener("change", this.handleMotionPreference);
    this.revealObserver?.disconnect();
    this.motionPreference = null;
    this.revealObserver = null;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.ticking = false;
  }

  @WindowListener({ event: ["scroll", "resize"] })
  /** Batches viewport changes so all showcase motion is updated once per frame. */
  scheduleMotionRender(): void {
    this.scheduleMotionFrame();
  }

  /** Reapplies reveal behavior and schedules a frame after preference changes. */
  private readonly handleMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.observeRevealElements();
    this.scheduleMotionFrame();
  };

  /** Queues one animation frame for hero, spotlight, and reveal state updates. */
  private scheduleMotionFrame(): void {
    if (this.ticking) {
      return;
    }

    this.ticking = true;
    this.frameId = requestAnimationFrame(() => {
      this.updateMotionStyles();
      this.ticking = false;
      this.frameId = null;
    });
  }

  /** Calculates normalized scroll progress for a pinned showcase wrapper. */
  private getScrollProgress(wrapper: HTMLElement): number {
    const rect = wrapper.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    return distance <= 0 ? 0 : clamp(-rect.top / distance, 0, 1);
  }

  /** Applies the current scroll state to the hero, spotlights, and index dots. */
  private updateMotionStyles(): void {
    const page = document.querySelector<HTMLElement>("showcase-page");
    const heroWrap = page?.querySelector<HTMLElement>("#showcase-hero-wrap");
    const heroInner = page?.querySelector<HTMLElement>("#showcase-hero-inner");
    if (!page || !heroWrap || !heroInner) {
      return;
    }

    const heroProgress = this.getScrollProgress(heroWrap);
    if (!this.reducedMotion) {
      heroInner.style.opacity = String(clamp(1 - heroProgress * 1.4, 0, 1));
      heroInner.style.transform = `scale(${1 - heroProgress * 0.1}) translate3d(0, ${heroProgress * -30}px, 0)`;
    }

    const spotlights = Array.from(page.querySelectorAll<HTMLElement>("[data-showcase-spotlight]"));
    spotlights.forEach((spotlight) => this.updateSpotlightStyles(spotlight));

    const indexDots = Array.from(page.querySelectorAll<HTMLElement>("[data-showcase-spotlight-index]"));
    if (indexDots.length > 0 && spotlights.length > 0) {
      const activeIndex = spotlights.findIndex((spotlight) => {
        const progress = this.getScrollProgress(spotlight);
        return progress > 0.08 && progress < 0.92;
      });
      indexDots.forEach((dot, index) => dot.classList.toggle("is-active", index === (activeIndex < 0 ? 0 : activeIndex)));
    }
  }

  /**
   * Applies progress-based transforms and metric values to one spotlight.
   *
   * @param wrapper - Spotlight wrapper containing the motion targets emitted by
   *                  `showcase-spotlight`.
   */
  private updateSpotlightStyles(wrapper: HTMLElement): void {
    const cover = wrapper.querySelector<HTMLElement>("[data-showcase-cover]");
    const copy = wrapper.querySelector<HTMLElement>(".showcase-spotlight-copy");
    const chips = Array.from(wrapper.querySelectorAll<HTMLElement>("[data-showcase-chip]"));
    const metric = wrapper.querySelector<HTMLElement>("[data-showcase-metric]");
    const button = wrapper.querySelector<HTMLElement>(".showcase-spotlight-copy .showcase-button");
    const finalMetric = Number(metric?.dataset.metricValue ?? 0);
    const progress = this.getScrollProgress(wrapper);
    const revealProgress = clamp((progress - 0.08) / 0.78, 0, 1);

    if (metric) {
      metric.textContent = this.reducedMotion ? String(finalMetric) : String(Math.round(revealProgress * finalMetric));
    }

    if (this.reducedMotion) {
      return;
    }

    if (cover) {
      const coverProgress = clamp(progress * 2, 0, 1);
      cover.style.transform = `scale(${0.9 + coverProgress * 0.1})`;
      cover.style.borderRadius = `${28 - coverProgress * 10}px`;
    }
    if (copy) {
      copy.style.opacity = String(clamp((progress - 0.08) * 3, 0, 1));
      copy.style.transform = `translate3d(0, ${(1 - clamp((progress - 0.08) * 3, 0, 1)) * 28}px, 0)`;
    }
    chips.forEach((chip, index) => {
      const chipProgress = clamp((progress - 0.24 - index * 0.05) * 5, 0, 1);
      chip.style.opacity = String(chipProgress);
      chip.style.transform = `translate3d(0, ${(1 - chipProgress) * 10}px, 0)`;
    });
    if (button) {
      const buttonProgress = clamp((progress - 0.5) * 3, 0, 1);
      button.style.opacity = String(buttonProgress);
      button.style.transform = `translate3d(0, ${(1 - buttonProgress) * 12}px, 0)`;
    }
  }

  /** Rebuilds the reveal observer or immediately reveals content for reduced motion. */
  private observeRevealElements(): void {
    this.revealObserver?.disconnect();
    const page = document.querySelector<HTMLElement>("showcase-page");
    const reveals = Array.from(page?.querySelectorAll<HTMLElement>("[data-showcase-reveal]") ?? []);

    if (this.reducedMotion) {
      reveals.forEach((element) => element.classList.add("is-in"));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          const siblings = element.parentElement
            ? Array.from(element.parentElement.querySelectorAll<HTMLElement>("[data-showcase-reveal]"))
            : [];
          element.style.transitionDelay = `${Math.max(0, siblings.indexOf(element)) * 60}ms`;
          element.classList.add("is-in");
          this.revealObserver?.unobserve(element);
        });
      },
      { threshold: 0.12 },
    );

    reveals.forEach((element) => this.revealObserver?.observe(element));
  }

  /** Behavior-only components render no host markup. */
  render(): string {
    return "";
  }
}
