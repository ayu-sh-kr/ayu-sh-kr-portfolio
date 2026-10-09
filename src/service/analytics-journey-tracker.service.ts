import type {AnalyticsFormName} from "@app/events/analytics.events.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

/**
 * Measures shared journeys without collecting input values or arbitrary link URLs.
 * Bootstrap owns one instance; route hooks reset deduplication and disconnect releases
 * all listeners and frames. Content depth waits for Markdown to finish loading.
 */
export class AnalyticsJourneyTracker {
  private controller: AbortController | null = null;
  private mutationObserver: MutationObserver | null = null;
  private frame: number | null = null;
  private pagePath = "";
  private readonly startedForms = new Set<AnalyticsFormName>();
  private readonly milestones = new Set<number>();
  private readonly invalidForms = new Set<AnalyticsFormName>();

  /** Installs delegated listeners once, including capture for non-bubbling validity errors. */
  start(): void {
    if (this.controller) return;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    document.addEventListener("click", this.trackLink, {capture: true, signal});
    document.addEventListener("input", this.trackFormStart, {signal});
    document.addEventListener("change", this.trackFormStart, {signal});
    document.addEventListener("invalid", this.trackInvalid, {capture: true, signal});
    window.addEventListener("scroll", this.scheduleProgress, {passive: true, signal});
    window.addEventListener("resize", this.scheduleProgress, {signal});
    document.addEventListener("visibilitychange", this.scheduleProgress, {signal});
    this.mutationObserver = new MutationObserver(this.scheduleProgress);
    this.mutationObserver.observe(document.getElementById("app") ?? document.body, {
      childList: true, subtree: true, attributes: true, attributeFilter: ["aria-busy"],
    });
  }

  /** Starts a fresh journey on a changed pathname; repeated bootstrap hooks preserve deduplication. */
  trackPage(pagePath: string): void {
    if (this.pagePath !== pagePath) {
      this.pagePath = pagePath;
      this.startedForms.clear();
      this.milestones.clear();
    }
    this.scheduleProgress();
  }

  /** Releases delegated listeners and pending work when this application instance stops. */
  disconnect(): void {
    this.controller?.abort();
    this.controller = null;
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  /** Resolves only the three authored form owners; it never reads their input values. */
  private formName(target: EventTarget | null): AnalyticsFormName | null {
    if (!(target instanceof Element)) return null;
    if (target.closest("blog-subscription")) return "blog_subscription";
    if (target.closest("pricing-start-project")) return "project_brief";
    if (target.closest("support-ticket")) return "support_ticket";
    return null;
  }

  /** Emits the first actual edit per form and route, rather than treating focus as intent. */
  private readonly trackFormStart = (event: Event): void => {
    const form = this.formName(event.target);
    if (!form || this.startedForms.has(form)) return;
    this.startedForms.add(form);
    publishAnalyticsEvent({eventName: "form_start", params: {form_name: form}});
  };

  /** Coalesces multiple invalid fields into one validation outcome per browser validation pass. */
  private readonly trackInvalid = (event: Event): void => {
    const form = this.formName(event.target);
    if (!form || this.invalidForms.has(form)) return;
    this.invalidForms.add(form);
    publishAnalyticsEvent({eventName: "form_error", params: {form_name: form, reason: "validation"}});
    queueMicrotask(() => this.invalidForms.delete(form));
  };

  /** Tracks shared chrome and Dispatch discovery using same-origin paths only. */
  private readonly trackLink = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element) || event.button !== 0) return;
    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    const surface = anchor.closest("app-header") ? "header" : anchor.closest("app-footer") ? "footer" : null;
    if (surface) {
      publishAnalyticsEvent({eventName: "navigation_click", params: {surface, destination: url.pathname}});
    }
    const note = /^\/news\/([^/]+)\/?$/.exec(url.pathname);
    if (note && url.pathname !== window.location.pathname) {
      publishAnalyticsEvent({eventName: "news_open", params: {slug: note[1]}});
    }
  };

  /** Coalesces scroll, rendering, and visibility changes into one geometry read per frame. */
  private readonly scheduleProgress = (): void => {
    if (this.frame !== null) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.trackProgress();
    });
  };

  /** Emits bounded viewport-depth milestones only for visible, fully rendered article bodies. */
  private trackProgress(): void {
    if (document.visibilityState === "hidden" || window.location.pathname !== this.pagePath) return;
    const route = /^\/(blog|news|showcase)\/([^/]+)\/?$/.exec(this.pagePath);
    if (!route) return;
    const kind = route[1] as "blog" | "news" | "showcase";
    const content = document.querySelector<HTMLElement>(`.${kind}-markdown-content`);
    if (!content || content.closest('[aria-busy="true"]') || !content.querySelector("p, h2, pre, ul")) return;
    const bounds = content.getBoundingClientRect();
    if (bounds.height <= 0 || bounds.top >= window.innerHeight) return;
    const percent = Math.min(100, Math.max(0, (window.innerHeight - bounds.top) / bounds.height * 100));
    for (const milestone of [25, 50, 75, 100] as const) {
      if (percent < milestone || this.milestones.has(milestone)) continue;
      this.milestones.add(milestone);
      publishAnalyticsEvent({eventName: "content_progress", params: {kind, slug: route[2], percent: milestone}});
    }
  }
}
