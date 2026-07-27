import { BaseElement, Component, HTML, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Visual states used while the sticky contact bar enters, remains, or exits view.
 * `icon` is the short transition state between hidden and the fully open bar.
 */
type StickyState = "hidden" | "icon" | "open";

/**
 * Displays a compact pricing contact bar after the visitor leaves the main CTA.
 *
 * An intersection observer tracks the main contact section, while scroll and
 * resize handlers update visibility and width. Motion preference changes switch
 * the state transitions between animated and immediate class updates; disconnect
 * cleanup removes observers, timers, and media-query listeners.
 *
 * Selector: `pricing-sticky-contact`.
 */
@Component({
  selector: "pricing-sticky-contact",
  shadow: false,
})
export class PricingStickyContactComponent extends BaseElement {
  private state: StickyState = "hidden";
  private contactVisible = false;
  private reducedMotion = false;
  private motionPreference: MediaQueryList | null = null;
  private contactObserver: IntersectionObserver | null = null;
  private transitionTimer: number | null = null;
  private stickyBar: HTMLElement | null = null;

  constructor() {
    super();
  }

  /** Captures the bar, starts preference tracking, and observes the main contact CTA. */
  @OnEvent("connected", true)
  initializeStickyContact(): void {
    this.stickyBar = this.querySelector<HTMLElement>("#pricing-stickybar");
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.updateMotionPreference);
    this.observeContactVisibility();
    this.measureStickyBar();
    this.updateVisibility();
  }

  /** Removes observers/listeners and resets state so reconnects start from hidden. */
  @OnEvent("disconnected", true)
  cleanupStickyContact(): void {
    this.motionPreference?.removeEventListener("change", this.updateMotionPreference);
    this.contactObserver?.disconnect();
    this.clearTransitionTimer();
    this.motionPreference = null;
    this.contactObserver = null;
    this.stickyBar = null;
    this.state = "hidden";
    this.contactVisible = false;
  }

  /** Recalculates the bar width and visibility after a viewport resize. */
  @WindowListener({ event: "resize" })
  refreshStickyLayout(): void {
    this.measureStickyBar();
    this.updateVisibility();
  }

  /** Applies a changed motion preference and removes any transition in progress. */
  private readonly updateMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.clearTransitionTimer();
    if (this.stickyBar) {
      this.stickyBar.classList.toggle("is-open", this.state !== "hidden");
      this.stickyBar.classList.remove("is-icon");
    }
  };

  /** Observes the main pricing contact section to suppress the duplicate sticky CTA. */
  private observeContactVisibility(): void {
    this.contactObserver?.disconnect();
    this.contactObserver = null;
    const contact = document.querySelector<HTMLElement>("#pricing-contact");
    if (!contact) {
      return;
    }

    this.contactObserver = new IntersectionObserver(
      ([entry]) => {
        this.contactVisible = entry?.isIntersecting ?? false;
        this.updateVisibility();
      },
      { threshold: 0.1 },
    );
    this.contactObserver.observe(contact);
  }

  /** Measures the content pill and stores its responsive width as a CSS variable. */
  private measureStickyBar(): void {
    const body = this.querySelector<HTMLElement>(".pricing-sticky-body");
    if (!body || !this.stickyBar) {
      return;
    }

    const maxWidth = Math.max(0, Math.min(560, window.innerWidth - 24));
    this.stickyBar.style.setProperty("--pricing-sticky-width", `${Math.min(body.scrollWidth + 8, maxWidth)}px`);
  }

  /** Updates contact visibility and selects the sticky bar state for the current scroll. */
  @WindowListener({ event: "scroll" })
  private updateVisibility(): void {
    if (!this.stickyBar) {
      return;
    }

    const contact = document.querySelector<HTMLElement>("#pricing-contact");
    if (contact) {
      this.contactVisible = contact.getBoundingClientRect().top < window.innerHeight * 0.85;
    }

    const shouldShow = window.scrollY > window.innerHeight * 0.55 && !this.contactVisible;
    this.setStickyState(shouldShow ? "open" : "hidden");
  }

  /** Applies the target visual state with reduced-motion and transition timing rules. */
  private setStickyState(target: StickyState): void {
    if (!this.stickyBar || target === this.state) {
      return;
    }

    this.clearTransitionTimer();

    if (this.reducedMotion) {
      this.stickyBar.classList.toggle("is-open", target !== "hidden");
      this.stickyBar.classList.remove("is-icon");
      this.state = target;
      return;
    }

    if (target === "open") {
      if (this.state === "hidden") {
        this.stickyBar.classList.add("is-icon");
        this.transitionTimer = window.setTimeout(() => {
          this.stickyBar?.classList.remove("is-icon");
          this.stickyBar?.classList.add("is-open");
          this.transitionTimer = null;
        }, 180);
      } else {
        this.stickyBar.classList.remove("is-icon");
        this.stickyBar.classList.add("is-open");
      }
      this.state = "open";
      return;
    }

    if (this.state === "open") {
      this.stickyBar.classList.remove("is-open");
      this.stickyBar.classList.add("is-icon");
      this.transitionTimer = window.setTimeout(() => {
        this.stickyBar?.classList.remove("is-icon");
        this.transitionTimer = null;
      }, 360);
    } else {
      this.stickyBar.classList.remove("is-icon", "is-open");
    }
    this.state = "hidden";
  }

  /** Cancels the pending open/close transition timer, if one exists. */
  private clearTransitionTimer(): void {
    if (this.transitionTimer !== null) {
      window.clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
  }

  /** Returns the sticky contact markup; state classes are applied after connection. */
  render(): string {
    const content = pricingContent.stickyContact;

    return HTML`
      <div id="pricing-stickybar" role="region" aria-label="${content.ariaLabel}">
        <span class="pricing-sticky-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z" /><path d="m5 7 7 5 7-5" /></svg>
        </span>
        <span class="pricing-sticky-body">
          <span class="pricing-sticky-label"><b>${content.labelStrong}</b> ${content.label}</span>
          <a class="pricing-sticky-button" href="#pricing-contact">${content.cta}</a>
        </span>
      </div>
    `;
  }
}
