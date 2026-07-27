import { BaseElement, Component, HostListener, HTML, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Allowed pricing-page destinations for the segmented service switch.
 * The values match the IDs of the build and speaking sections that receive focus
 * after a tab is selected.
 */
type PricingDestination = "build" | "speak";

/**
 * Switches between build and speaking sections on the pricing page.
 *
 * The selected tab updates its ARIA state, hint copy, and thumb position, then
 * scrolls to the corresponding section. Resize work is frame-coalesced so the
 * indicator follows layout changes without accumulating animation frames.
 *
 * Selector: `pricing-switch`.
 */
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

  /** Captures the switch thumb and positions it against the initial active tab. */
  @OnEvent("connected", true)
  initializeSwitch(): void {
    this.thumb = this.querySelector<HTMLElement>("#pricing-switch-thumb");
    this.positionThumb();
  }

  /** Cancels a pending thumb-position frame when the switch disconnects. */
  @OnEvent("disconnected", true)
  cleanupSwitch(): void {
    if (this.positionFrame !== null) {
      cancelAnimationFrame(this.positionFrame);
      this.positionFrame = null;
    }
  }

  /** Repositions the thumb when the switch layout changes with the viewport. */
  @WindowListener({ event: "resize" })
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

  /**
   * Updates the selected destination, hint, thumb, and scroll target from a tab click.
   * @param event - Host click used to locate the selected destination button.
   */
  @HostListener({ event: "click" })
  selectDestination(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-pricing-destination]");
    if (!button || !this.contains(button)) {
      return;
    }

    const destinationId = button.dataset.pricingDestination;
    if (destinationId !== "build" && destinationId !== "speak") {
      return;
    }

    this.activeDestination = destinationId;
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

    const destinationSection = document.querySelector<HTMLElement>(`#pricing-${this.activeDestination}`);
    destinationSection?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  /** Returns the segmented service switch with the build destination active by default. */
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
