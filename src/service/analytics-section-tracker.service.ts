import {isAnalyticsSection} from "@app/events/analytics.events.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

/**
 * Publishes one visibility event for each important marked section on a route.
 *
 * The router calls `trackPage` after it renders a destination. Intersection
 * Observer then waits until a section is genuinely visible, while `seenSections`
 * prevents scroll oscillation from creating repeated events in one browser session.
 */
export class AnalyticsSectionTracker {
  private observer: IntersectionObserver | null = null;
  private readonly seenSections = new Set<string>();

  /**
   * Replaces the previous route observer and watches marked sections in the new page.
   *
   * @param pagePath - Destination pathname used to group section events in GA4.
   */
  trackPage(pagePath: string): void {
    this.observer?.disconnect();
    this.observer = null;

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const sections = document.querySelectorAll<HTMLElement>("[data-analytics-section]");
    if (sections.length === 0) {
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const section = (entry.target as HTMLElement).dataset.analyticsSection;
        if (!isAnalyticsSection(section)) {
          return;
        }

        const eventKey = `${pagePath}:${section}`;
        if (this.seenSections.has(eventKey)) {
          return;
        }

        this.seenSections.add(eventKey);
        publishAnalyticsEvent({
          eventName: "section_view",
          params: {section, page_path: pagePath},
        });
      });
    }, {threshold: 0.35});

    sections.forEach((section) => this.observer?.observe(section));
  }

  /** Releases the active observer when the application no longer needs tracking. */
  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
