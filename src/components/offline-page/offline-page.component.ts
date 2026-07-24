import { Component, DotaPageElement, HTML, HostListener, SEO, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { Route } from "@ayu-sh-kr/dota-wrap/router";

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

@Route({ path: "/offline" })
@Component({
  selector: "offline-page",
  shadow: false,
})
export class OfflinePage extends DotaPageElement {
  private readonly glyphTick = 320;
  private readonly glyphHold = 700;
  private glyphTimer: number | null = null;
  private retryTimer: number | null = null;
  private initialCheckTimer: number | null = null;
  private retryInterval: number | null = null;
  private metaInterval: number | null = null;
  private animationFrame: number | null = null;
  private motionPreference: MediaQueryList | null = null;
  private reducedMotion = false;
  private ticking = false;
  private isOnline = navigator.onLine;
  private checking = false;
  private glyphIndex = 0;
  private filling = true;
  private lastTry = Date.now();

  constructor() {
    super();
  }

  get seo(): SEO {
    return {
      title: "Connection status — Ayush Jaiswal",
      description: "Connection status and recovery options for the Ayush Jaiswal portfolio.",
      keywords: ["Connection status", "Offline page", "Ayush Jaiswal"],
      og: {
        title: "Connection status — Ayush Jaiswal",
        description: "Connection status and recovery options for the portfolio.",
      },
    };
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.handleMotionPreference);
    this.applyConnectivityState(navigator.onLine);
    this.scheduleRender();
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.motionPreference?.removeEventListener("change", this.handleMotionPreference);
    this.motionPreference = null;
    this.clearTimers();
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.ticking = false;
  }

  @WindowListener({ event: "online" })
  onOnline(): void {
    this.applyConnectivityState(true);
  }

  @WindowListener({ event: "offline" })
  onOffline(): void {
    this.applyConnectivityState(false);
  }

  @WindowListener({ event: "resize" })
  onResize(): void {
    this.scheduleRender();
  }

  @HostListener({ event: "scroll" })
  onScroll(): void {
    this.scheduleRender();
  }

  @HostListener({ event: "click" })
  onHostClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-offline-action]");
    if (!target || !this.contains(target)) {
      return;
    }

    if (target.dataset.offlineAction === "retry") {
      if (this.isOnline) {
        window.location.assign("/");
      } else {
        this.check(true);
      }
    }
  }

  private readonly handleMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.clearGlyphTimer();

    if (this.reducedMotion || this.isOnline) {
      this.getMarks().forEach((mark) => mark.classList.add("is-lit"));
    } else {
      this.getMarks().forEach((mark) => mark.classList.remove("is-lit"));
      this.glyphIndex = 0;
      this.filling = true;
      this.scheduleGlyphStep(this.glyphTick);
    }

    this.resetStageStyles();
    this.scheduleRender();
  };

  private applyConnectivityState(isOnline: boolean): void {
    this.isOnline = isOnline;
    this.clearConnectivityTimers();
    this.clearGlyphTimer();

    const troubleshoot = this.querySelector<HTMLElement>("offline-troubleshoot");
    const cue = this.querySelector<HTMLElement>("[data-offline-cue]");
    troubleshoot?.toggleAttribute("hidden", isOnline);
    cue?.toggleAttribute("hidden", isOnline);

    if (isOnline) {
      this.getMarks().forEach((mark) => mark.classList.add("is-lit"));
      this.querySelector<HTMLElement>("[data-offline-glyph]")?.setAttribute("aria-label", "Wi-Fi connection is active");
      this.setText("[data-offline-nav-status]", "Connection active");
      this.setText("[data-offline-eyebrow]", "Connection restored");
      this.setText("[data-offline-title-lead]", "You're");
      this.setText("[data-offline-title-accent]", "online.");
      this.setText("[data-offline-lede]", "Your connection is working. Continue to the portfolio whenever you're ready.");
      this.setStatus("You're connected.", true);
      this.setCode("NETWORK · online");
      this.querySelectorAll<HTMLButtonElement>("[data-offline-retry]").forEach((button) => {
        button.textContent = "Continue to home";
        button.disabled = false;
      });
      this.resetStageStyles();
      return;
    }

    this.setText("[data-offline-nav-status]", "Offline mode");
    this.setText("[data-offline-eyebrow]", "Connection lost");
    this.setText("[data-offline-title-lead]", "You're");
    this.setText("[data-offline-title-accent]", "offline.");
    this.setText("[data-offline-lede]", "This page can't reach the server right now. It will load again when your network comes back — I'm already checking.");
    this.setStatus("Trying to reconnect…");
    this.setCode("ERR_NETWORK · offline");
    this.querySelectorAll<HTMLButtonElement>("[data-offline-retry]").forEach((button) => {
      button.textContent = "Try again";
    });
    this.startGlyphSignal();
    this.startConnectivityChecks();
  }

  private setText(selector: string, value: string): void {
    const element = this.querySelector<HTMLElement>(selector);
    if (element) {
      element.textContent = value;
    }
  }

  private startGlyphSignal(): void {
    const marks = this.getMarks();
    if (this.reducedMotion || this.isOnline) {
      marks.forEach((mark) => mark.classList.add("is-lit"));
      return;
    }

    marks.forEach((mark) => mark.classList.remove("is-lit"));
    this.glyphIndex = 0;
    this.filling = true;
    this.scheduleGlyphStep(this.glyphTick);
  }

  private scheduleGlyphStep(delay: number): void {
    this.clearGlyphTimer();
    this.glyphTimer = window.setTimeout(() => this.stepGlyph(), delay);
  }

  private stepGlyph(): void {
    if (this.isOnline || this.reducedMotion) {
      return;
    }

    const marks = this.getMarks();
    const mark = marks[this.glyphIndex];
    if (!mark) {
      return;
    }

    mark.classList.toggle("is-lit", this.filling);
    this.glyphIndex += 1;

    if (this.glyphIndex >= marks.length) {
      this.glyphIndex = 0;
      this.filling = !this.filling;
      this.scheduleGlyphStep(this.glyphHold);
      return;
    }

    this.scheduleGlyphStep(this.glyphTick);
  }

  private getMarks(): SVGElement[] {
    return Array.from(this.querySelectorAll<SVGElement>("[data-offline-mark]")).reverse();
  }

  private startConnectivityChecks(): void {
    this.clearConnectivityTimers();
    this.lastTry = Date.now();
    this.updateLastTry();
    this.retryInterval = window.setInterval(() => this.check(false), 5000);
    this.metaInterval = window.setInterval(() => this.updateLastTry(), 1000);
    this.initialCheckTimer = window.setTimeout(() => {
      this.initialCheckTimer = null;
      this.check(false);
    }, 600);
  }

  private check(manual: boolean): void {
    if (this.checking || this.isOnline) {
      return;
    }

    this.checking = true;
    this.lastTry = Date.now();
    this.updateLastTry();

    if (manual) {
      this.setStatus("Trying to reach the server…");
      this.setRetryDisabled(true);
    }

    this.clearRetryTimer();
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = null;
      this.checking = false;
      this.setRetryDisabled(false);

      // Production health check can replace this browser hint with a short same-origin HEAD request.
      if (navigator.onLine) {
        this.applyConnectivityState(true);
      } else if (manual) {
        this.setStatus("Still no connection. Check your network and try again.");
      } else {
        this.setStatus("Trying to reconnect…");
      }
    }, manual ? 900 : 400);
  }

  private setStatus(message: string, linked = false): void {
    const status = this.querySelector<HTMLElement>("[data-offline-status]");
    const statusText = this.querySelector<HTMLElement>("[data-offline-status-text]");
    status?.classList.toggle("is-linked", linked);
    if (statusText) {
      statusText.textContent = message;
    }
  }

  private setCode(message: string): void {
    const code = this.querySelector<HTMLElement>("[data-offline-code]");
    if (code) {
      code.textContent = message;
    }
  }

  private setRetryDisabled(disabled: boolean): void {
    this.querySelectorAll<HTMLButtonElement>("[data-offline-retry]").forEach((button) => {
      button.disabled = disabled;
    });
  }

  private updateLastTry(): void {
    const meta = this.querySelector<HTMLElement>("[data-offline-meta]");
    if (!meta || this.isOnline) {
      return;
    }

    const seconds = Math.round((Date.now() - this.lastTry) / 1000);
    meta.textContent = seconds < 3 ? "Last tried just now" : `Last tried ${seconds}s ago`;
  }

  private scheduleRender(): void {
    if (this.ticking) {
      return;
    }

    this.ticking = true;
    this.animationFrame = requestAnimationFrame(() => {
      this.renderStage();
      this.ticking = false;
      this.animationFrame = null;
    });
  }

  private renderStage(): void {
    const hero = this.querySelector<HTMLElement>("offline-hero");
    const troubleshoot = this.querySelector<HTMLElement>("offline-troubleshoot");
    const nav = this.querySelector<HTMLElement>("#offline-nav");

    if (!hero || !troubleshoot) {
      return;
    }

    const heroInner = hero.querySelector<HTMLElement>(".offline-panel-inner");
    const troubleshootInner = troubleshoot.querySelector<HTMLElement>(".offline-panel-inner");
    if (!heroInner || !troubleshootInner) {
      return;
    }

    const { scrollTop, clientHeight } = this;
    nav?.classList.toggle("is-scrolled", scrollTop > 40);
    if (this.reducedMotion || clientHeight <= 0) {
      this.resetStageStyles();
      return;
    }

    const scrollRect = this.getBoundingClientRect();
    const troubleshootStart = troubleshoot.getBoundingClientRect().top - scrollRect.top + scrollTop;
    const revealProgress = clamp(
      (scrollTop - troubleshootStart + clientHeight * 0.75) / (clientHeight * 0.75),
      0,
      1,
    );
    const exitProgress = clamp(scrollTop / (clientHeight * 0.75), 0, 1);

    heroInner.style.opacity = String(1 - exitProgress * 0.65);
    heroInner.style.transform = `translate3d(0, ${exitProgress * -32}px, 0)`;
    troubleshootInner.style.opacity = String(revealProgress);
    troubleshootInner.style.transform = `translate3d(0, ${(1 - revealProgress) * 32}px, 0)`;
    hero.toggleAttribute("inert", exitProgress > 0.7);
    troubleshoot.toggleAttribute("inert", revealProgress < 0.5);
  }

  private resetStageStyles(): void {
    const hero = this.querySelector<HTMLElement>("offline-hero");
    const troubleshoot = this.querySelector<HTMLElement>("offline-troubleshoot");
    hero?.querySelector<HTMLElement>(".offline-panel-inner")?.style.removeProperty("opacity");
    hero?.querySelector<HTMLElement>(".offline-panel-inner")?.style.removeProperty("transform");
    troubleshoot?.querySelector<HTMLElement>(".offline-panel-inner")?.style.removeProperty("opacity");
    troubleshoot?.querySelector<HTMLElement>(".offline-panel-inner")?.style.removeProperty("transform");
    hero?.removeAttribute("inert");
    troubleshoot?.removeAttribute("inert");
  }

  private clearGlyphTimer(): void {
    if (this.glyphTimer !== null) {
      window.clearTimeout(this.glyphTimer);
      this.glyphTimer = null;
    }
  }

  private clearRetryTimer(): void {
    if (this.retryTimer !== null) {
      window.clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private clearConnectivityTimers(): void {
    if (this.initialCheckTimer !== null) {
      window.clearTimeout(this.initialCheckTimer);
      this.initialCheckTimer = null;
    }
    if (this.retryInterval !== null) {
      window.clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    if (this.metaInterval !== null) {
      window.clearInterval(this.metaInterval);
      this.metaInterval = null;
    }
    this.checking = false;
  }

  private clearTimers(): void {
    this.clearGlyphTimer();
    this.clearRetryTimer();
    this.clearConnectivityTimers();
  }

  render(): string {
    return HTML`
      <nav id="offline-nav" aria-label="Offline navigation">
        <div class="offline-nav-inner">
          <a class="offline-brand" href="/">ayush.dev</a>
          <span class="offline-nav-status" data-offline-nav-status>Offline mode</span>
        </div>
      </nav>

      <main id="offline-main">
        <div id="offline-scroll-container" aria-label="Connection help">
          <offline-hero></offline-hero>
          <offline-troubleshoot inert></offline-troubleshoot>
          <footer class="offline-footer">
            <span>Served from the portfolio edge</span>
            <span class="offline-code" data-offline-code>ERR_NETWORK · offline</span>
          </footer>
        </div>
      </main>
    `;
  }
}
