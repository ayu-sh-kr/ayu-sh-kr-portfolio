import {BaseElement, Component, HTML, HostListener, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {Consent, type ConsentChoice, type ConsentMode, type ConsentState} from "@app/service/consent.service.ts";

/** Authored copy and action definitions for the two supported notice modes. */
const COPY: Record<ConsentMode, {title: string; description: string; actions: readonly {choice: ConsentChoice; label: string; className: string}[]}> = {
  notice: {
    title: "No advertising or cross-site tracking.",
    description: "Analytics are anonymous and cookieless. A small number of preferences stays on your device.",
    actions: [{choice: "ack", label: "Got it", className: "consent-notice__button--solid"}],
  },
  consent: {
    title: "Your choice about cookies.",
    description: "Essential storage keeps the site working. Anything beyond that only runs if you say so.",
    actions: [
      {choice: "essential", label: "Essential only", className: "consent-notice__button--quiet"},
      {choice: "all", label: "Accept all", className: "consent-notice__button--quiet"},
    ],
  },
};

/**
 * Persistent, non-blocking privacy notice mounted before the routed app.
 *
 * The component subscribes to {@link Consent} after it connects and renders the
 * machine's `shown`, `settled`, or `dormant` state without reading storage itself.
 * The inline bootstrap guard in `index.html` hides the prerendered notice until
 * that first client-side decision is known, preventing an SSG flash for returning
 * visitors. Its measured height is published on `<html>` so other bottom-fixed
 * controls can move above it without creating another stacking layer.
 *
 * Selector: `consent-notice`.
 */
@Component({
  selector: "consent-notice",
  shadow: false,
})
export class ConsentNoticeComponent extends BaseElement {
  /** Attribute `mode`; accepts `notice` or `consent`, defaulting to `notice`. Changing it reopens the notice in that mode. */
  @Property({name: "mode", type: String})
  mode: ConsentMode = "notice";

  /** Removes the state subscription when the element leaves the document. */
  private unsubscribe: (() => void) | null = null;
  /** Watches wrapping changes so bottom controls receive the current notice height. */
  private resizeObserver: ResizeObserver | null = null;
  /** Delays hiding until the exit transition completes. */
  private closeTimer: number | null = null;

  constructor() {
    super();
  }

  /**
   * Subscribes the view, resolves the persisted decision, and starts height
   * measurement after the framework has rendered the notice markup.
   */
  @OnEvent("connected", true)
  initializeNotice(): void {
    this.unsubscribe = Consent.observe(this.renderState);
    Consent.boot(this.mode === "consent" ? "consent" : "notice");
    this.resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(() => this.publishHeight())
      : null;
  }

  /**
   * Releases the consent subscription, observer, exit timer, and root height
   * variable so a disconnected notice cannot affect later route content.
   */
  @OnEvent("disconnected", true)
  cleanupNotice(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.clearCloseTimer();
    this.clearHeight();
  }

  /**
   * Reports a button choice to the state machine. The link is intentionally not
   * handled here; only buttons carry `data-consent-choice`.
   */
  @HostListener({event: "click"})
  decideFromClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-consent-choice]");
    const choice = button?.dataset.consentChoice as ConsentChoice | undefined;
    if (choice) {
      Consent.decide(choice);
    }
  }

  /** Returns the stable region shell; state-specific copy and actions are added after connection. */
  render(): string {
    return HTML`
      <section class="consent-notice layout-pinned-bottom" role="region" aria-labelledby="consent-notice-title" hidden>
        <div class="consent-notice__body">
          <p class="consent-notice__title" id="consent-notice-title"></p>
          <p class="consent-notice__description"></p>
        </div>
        <div class="consent-notice__actions"></div>
      </section>
    `;
  }

  /**
   * Applies a consent snapshot to the DOM and keeps the document-level
   * pre-hydration state attribute aligned with the rendered phase.
   */
  private readonly renderState = (state: ConsentState): void => {
    document.documentElement.dataset.consentState = state.phase === "shown"
      ? "shown"
      : state.phase === "unknown"
        ? "pending"
        : "settled";
    const notice = this.querySelector<HTMLElement>(".consent-notice");
    const title = this.querySelector<HTMLElement>(".consent-notice__title");
    const description = this.querySelector<HTMLElement>(".consent-notice__description");
    const actions = this.querySelector<HTMLElement>(".consent-notice__actions");
    if (!notice || !title || !description || !actions) {
      return;
    }

    if (state.phase === "shown") {
      this.open(notice, title, description, actions, state.mode);
      return;
    }

    this.close(notice);
  };

  /**
   * Fills the action row for one mode, then starts the shared entrance motion
   * on the next two frames so the browser can commit the hidden start state.
   */
  private open(notice: HTMLElement, title: HTMLElement, description: HTMLElement, actions: HTMLElement, mode: ConsentMode): void {
    this.clearCloseTimer();
    const copy = COPY[mode];
    title.textContent = copy.title;
    description.textContent = copy.description;
    actions.replaceChildren();

    const link = document.createElement("a");
    link.className = "consent-notice__link";
    link.href = "/legal/privacy#cookies";
    link.textContent = "What’s stored";
    actions.append(link);

    copy.actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `consent-notice__button ${action.className}`;
      button.dataset.consentChoice = action.choice;
      button.textContent = action.label;
      actions.append(button);
    });

    notice.hidden = false;
    notice.classList.remove("is-gone");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (notice.hidden) {
        return;
      }
      notice.classList.add("is-in");
      this.publishHeight();
      this.resizeObserver?.observe(notice);
    }));
  }

  /**
   * Stops height measurement, clears the published lift, and hides the region
   * after the exit transition rather than removing it during the fade.
   */
  private close(notice: HTMLElement): void {
    if (notice.hidden) {
      return;
    }

    this.resizeObserver?.unobserve(notice);
    notice.classList.remove("is-in");
    notice.classList.add("is-gone");
    this.clearHeight();
    this.clearCloseTimer();
    this.closeTimer = window.setTimeout(() => {
      notice.hidden = true;
      notice.classList.remove("is-gone");
      this.closeTimer = null;
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 160 : 240);
  }

  /** Publishes the visible region height for toast and sticky bottom controls. */
  private publishHeight(): void {
    const notice = this.querySelector<HTMLElement>(".consent-notice");
    if (!notice || notice.hidden) {
      return;
    }
    document.documentElement.style.setProperty("--chrome-consent-h", `${Math.round(notice.getBoundingClientRect().height)}px`);
  }

  /** Removes the shared bottom-control lift after the notice is hidden. */
  private clearHeight(): void {
    document.documentElement.style.removeProperty("--chrome-consent-h");
  }

  /** Cancels a pending exit so a mode change can reopen the same region cleanly. */
  private clearCloseTimer(): void {
    if (this.closeTimer !== null) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
