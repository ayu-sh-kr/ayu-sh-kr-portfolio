import { BaseElement, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

@Component({
  selector: "showcase-motion-controller",
  shadow: false,
})
export class ShowcaseMotionControllerComponent extends BaseElement {
  private ticking = false;
  private frameId: number | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private motionPreference: MediaQueryList | null = null;
  private reducedMotion = false;

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.handleMotionPreference);
    this.setupReveals();
    this.scheduleRender();
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.motionPreference?.removeEventListener("change", this.handleMotionPreference);
    this.revealObserver?.disconnect();
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  @WindowListener({ event: "scroll" })
  onScroll(): void {
    this.scheduleRender();
  }

  @WindowListener({ event: "resize" })
  onResize(): void {
    this.scheduleRender();
  }

  private readonly handleMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.setupReveals();
    this.scheduleRender();
  };

  private scheduleRender(): void {
    if (this.ticking) {
      return;
    }

    this.ticking = true;
    this.frameId = requestAnimationFrame(() => {
      this.renderAll();
      this.ticking = false;
      this.frameId = null;
    });
  }

  private progressOf(wrapper: HTMLElement): number {
    const rect = wrapper.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    return distance <= 0 ? 0 : clamp(-rect.top / distance, 0, 1);
  }

  private renderAll(): void {
    const page = document.querySelector<HTMLElement>("showcase-page");
    const heroWrap = page?.querySelector<HTMLElement>("#showcase-hero-wrap");
    const heroInner = page?.querySelector<HTMLElement>("#showcase-hero-inner");
    if (!page || !heroWrap || !heroInner) {
      return;
    }

    const heroProgress = this.progressOf(heroWrap);
    if (!this.reducedMotion) {
      heroInner.style.opacity = String(clamp(1 - heroProgress * 1.4, 0, 1));
      heroInner.style.transform = `scale(${1 - heroProgress * 0.1}) translate3d(0, ${heroProgress * -30}px, 0)`;
    }

    const spotlights = Array.from(page.querySelectorAll<HTMLElement>("[data-showcase-spotlight]"));
    spotlights.forEach((spotlight) => this.renderSpotlight(spotlight));

    const indexDots = Array.from(page.querySelectorAll<HTMLElement>("[data-showcase-spotlight-index]"));
    if (indexDots.length > 0 && spotlights.length > 0) {
      const activeIndex = spotlights.findIndex((spotlight) => {
        const progress = this.progressOf(spotlight);
        return progress > 0.08 && progress < 0.92;
      });
      indexDots.forEach((dot, index) => dot.classList.toggle("is-active", index === (activeIndex < 0 ? 0 : activeIndex)));
    }
  }

  private renderSpotlight(wrapper: HTMLElement): void {
    const cover = wrapper.querySelector<HTMLElement>("[data-showcase-cover]");
    const copy = wrapper.querySelector<HTMLElement>(".showcase-spotlight-copy");
    const chips = Array.from(wrapper.querySelectorAll<HTMLElement>("[data-showcase-chip]"));
    const metric = wrapper.querySelector<HTMLElement>("[data-showcase-metric]");
    const button = wrapper.querySelector<HTMLElement>(".showcase-spotlight-copy .showcase-button");
    const finalMetric = Number(metric?.dataset.metricValue ?? 0);
    const progress = this.progressOf(wrapper);
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

  private setupReveals(): void {
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

  render(): string {
    return "";
  }
}
