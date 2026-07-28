import { BaseElement, Component, HTML, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";

/**
 * Visual phases used while the coffee sticky action enters or exits the viewport.
 *
 * `icon` is deliberately transient: it lets the fixed action grow and collapse
 * around the cup glyph rather than appearing as a full-width control at once.
 */
type CoffeeStickyState = "hidden" | "icon" | "open";

/**
 * Returns visitors to the order flow after they have passed the hero.
 *
 * The bar uses an intersection observer to suppress itself while the order is
 * already visible. Outside that section it follows the pricing page's compact
 * icon-to-expanded-pill sequence, with an immediate open/hidden state for
 * reduced-motion users.
 *
 * Selector: `coffee-sticky`.
 */
@Component({
  selector: "coffee-sticky",
  shadow: false,
})
export class CoffeeStickyComponent extends BaseElement {
  private state: CoffeeStickyState = "hidden";
  private orderVisible = false;
  private reducedMotion = false;
  private motionPreference: MediaQueryList | null = null;
  private orderObserver: IntersectionObserver | null = null;
  private transitionTimer: number | null = null;
  private stickyBar: HTMLElement | null = null;

  /** Creates the component before its fixed pill has been rendered. */
  constructor() {
    super();
  }

  /** Captures the pill, observes the order section, and applies the initial state. */
  @OnEvent("connected", true)
  initializeStickyCoffee(): void {
    this.stickyBar = this.querySelector<HTMLElement>("#coffee-stickybar");
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.updateMotionPreference);
    this.observeOrderVisibility();
    this.measureStickyBar();
    this.updateVisibility();
  }

  /** Releases all observers, timers, and element references when navigating away. */
  @OnEvent("disconnected", true)
  cleanupStickyCoffee(): void {
    this.motionPreference?.removeEventListener("change", this.updateMotionPreference);
    this.orderObserver?.disconnect();
    this.clearTransitionTimer();
    this.motionPreference = null;
    this.orderObserver = null;
    this.stickyBar = null;
    this.state = "hidden";
    this.orderVisible = false;
  }

  /** Re-measures and re-evaluates the pill after the available viewport width changes. */
  @WindowListener({ event: "resize" })
  refreshStickyLayout(): void {
    this.measureStickyBar();
    this.updateVisibility();
  }

  /** Applies a new motion preference without leaving a staged transition running. */
  private readonly updateMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.clearTransitionTimer();
    if (!this.stickyBar) {
      return;
    }
    this.stickyBar.classList.toggle("is-open", this.state !== "hidden");
    this.stickyBar.classList.remove("is-icon");
  };

  /** Observes the order flow so a duplicate invitation is never shown beside it. */
  private observeOrderVisibility(): void {
    const order = document.querySelector<HTMLElement>("#coffee-order");
    if (!order) {
      return;
    }
    this.orderObserver = new IntersectionObserver(([entry]) => {
      this.orderVisible = entry?.isIntersecting ?? false;
      this.updateVisibility();
    }, { threshold: 0.1 });
    this.orderObserver.observe(order);
  }

  /** Measures the expanded label/button body and stores its safe responsive width. */
  private measureStickyBar(): void {
    const body = this.querySelector<HTMLElement>(".coffee-sticky-body");
    if (!body || !this.stickyBar) {
      return;
    }
    const maximumWidth = Math.max(0, Math.min(26.25 * 16, window.innerWidth - 24));
    this.stickyBar.style.setProperty("--coffee-sticky-width", `${Math.min(body.scrollWidth + 8, maximumWidth)}px`);
  }

  /** Chooses whether the pill should be visible based on scroll progress and order visibility. */
  @WindowListener({ event: "scroll" })
  private updateVisibility(): void {
    if (!this.stickyBar) {
      return;
    }
    const order = document.querySelector<HTMLElement>("#coffee-order");
    if (order) {
      const bounds = order.getBoundingClientRect();
      this.orderVisible = bounds.top < window.innerHeight * 0.7 && bounds.bottom > 40;
    }
    this.setStickyState(window.scrollY > window.innerHeight * 0.55 && !this.orderVisible ? "open" : "hidden");
  }

  /** Applies the requested hidden, icon, or expanded phase with the configured motion rules. */
  private setStickyState(target: CoffeeStickyState): void {
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

  /** Clears a pending state-transition timer before a new one is scheduled. */
  private clearTransitionTimer(): void {
    if (this.transitionTimer === null) {
      return;
    }
    window.clearTimeout(this.transitionTimer);
    this.transitionTimer = null;
  }

  /** Returns the fixed icon and expanded action, which both point to the order section. */
  render(): string {
    const content = coffeeContent.sticky;

    return HTML`
      <div id="coffee-stickybar" role="region" aria-label="${content.ariaLabel}">
        <span class="coffee-sticky-icon" aria-hidden="true">☕</span>
        <span class="coffee-sticky-body"><span class="coffee-sticky-label">☕ ${content.label}</span><a class="coffee-sticky-button" href="#coffee-order">${content.cta}</a></span>
      </div>
    `;
  }
}
