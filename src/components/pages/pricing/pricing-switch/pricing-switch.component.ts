import { BaseElement, Component, HostListener, HTML, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";

type PricingDestination = "build" | "speak";

@Component({
  selector: "pricing-switch",
  shadow: false,
})
export class PricingSwitchComponent extends BaseElement {
  private activeDestination: PricingDestination = "build";
  private thumb: HTMLElement | null = null;
  private positionFrame: number | null = null;

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.thumb = this.querySelector<HTMLElement>("#pricing-switch-thumb");
    this.positionThumb();
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    if (this.positionFrame !== null) {
      cancelAnimationFrame(this.positionFrame);
      this.positionFrame = null;
    }
  }

  @WindowListener({ event: "resize" })
  onResize(): void {
    this.positionThumb();
  }

  @HostListener({ event: "click" })
  onHostClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-pricing-destination]");
    if (!button || !this.contains(button)) {
      return;
    }

    this.activeDestination = button.dataset.pricingDestination as PricingDestination;
    this.querySelectorAll<HTMLButtonElement>("button[data-pricing-destination]").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-active", selected);
      option.setAttribute("aria-selected", String(selected));
    });
    const hint = this.querySelector<HTMLElement>("#pricing-switch-hint");
    if (hint) {
      hint.textContent = this.activeDestination === "build"
        ? pricingContent.serviceSwitch.buildHint
        : pricingContent.serviceSwitch.speakHint;
    }
    this.positionThumb();

    const destination = document.querySelector<HTMLElement>(`#pricing-${this.activeDestination}`);
    destination?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  private positionThumb(): void {
    if (this.positionFrame !== null) {
      cancelAnimationFrame(this.positionFrame);
    }

    this.positionFrame = requestAnimationFrame(() => {
      const active = this.querySelector<HTMLButtonElement>("button.is-active");
      if (active && this.thumb) {
        this.thumb.style.width = `${active.offsetWidth}px`;
        this.thumb.style.transform = `translateX(${active.offsetLeft - 4}px)`;
      }
      this.positionFrame = null;
    });
  }

  render(): string {
    const content = pricingContent.serviceSwitch;

    return HTML`
      <section class="pricing-switch-section" aria-labelledby="pricing-switch-title">
        <p id="pricing-switch-title" class="pricing-eyebrow">${content.eyebrow}</p>
        <div class="pricing-segmented-control" role="tablist" aria-label="${content.ariaLabel}">
          <span id="pricing-switch-thumb" aria-hidden="true"></span>
          <button class="is-active" data-pricing-destination="build" role="tab" aria-selected="true">${content.buildLabel}</button>
          <button data-pricing-destination="speak" role="tab" aria-selected="false">${content.speakLabel}</button>
        </div>
        <p id="pricing-switch-hint" class="pricing-switch-hint">${content.buildHint}</p>
      </section>
    `;
  }
}
