import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { portfolioContent } from "@app/data/portfolio-content.ts";

const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3);

@Component({
  selector: "footer-support",
  shadow: false,
})
export class FooterSupportComponent extends BaseElement {
  private observer: IntersectionObserver | null = null;
  private animationFrame: number | null = null;
  private hasAnimated = false;
  private odometer: HTMLElement | null = null;

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.odometer = this.querySelector<HTMLElement>(".footer-odometer");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      this.renderHours(portfolioContent.footer.support.hoursTarget);
      this.hasAnimated = true;
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.animateHours();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    this.observer.observe(this);
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.observer?.disconnect();
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.observer = null;
    this.odometer = null;
  }

  private animateHours(): void {
    const target = portfolioContent.footer.support.hoursTarget;
    const startedAt = performance.now();
    const duration = 1400;

    const tick = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / duration);
      this.renderHours(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(tick);
      } else {
        this.animationFrame = null;
      }
    };

    this.animationFrame = requestAnimationFrame(tick);
  }

  private renderHours(value: number): void {
    if (this.odometer) {
      this.odometer.textContent = `≈ ${value.toLocaleString("en-IN")}`;
    }
  }

  render(): string {
    const { ghostWord, support } = portfolioContent.footer;

    return HTML`
      <section class="footer-support-section" aria-labelledby="footer-support-title">
        <span class="footer-ghost-word" aria-hidden="true">${ghostWord}</span>
        <div class="footer-content footer-support-content">
          <p class="footer-eyebrow">${support.eyebrow}</p>
          <h2 id="footer-support-title" class="footer-col-title mt-3">
            ${support.titleLead} <span>${support.titleSoft}</span>
          </h2>
          <p class="footer-support-copy mt-6">
            <span class="footer-support-lede">${support.lede}</span> ${support.bodyBeforeHours}
            <span class="footer-odometer">≈ 0</span> ${support.bodyAfterHours}
          </p>
        </div>
      </section>
    `;
  }
}
