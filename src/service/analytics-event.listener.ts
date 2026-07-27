import {AutoBind, OnEvent, type ApplicationEvent} from "@ayu-sh-kr/dota-wrap/event";
import {ANALYTICS_TRACK_EVENT} from "@app/events/analytics.events.ts";

/**
 * Bridges typed application analytics facts to the GA4 browser API.
 *
 * This is a regular class rather than a component because it has no markup or
 * route ownership. `@AutoBind` registers its `@OnEvent` method with the shared
 * application listener when the instance is created after bootstrap. UI code
 * therefore publishes stable facts without depending directly on Google.
 */
@AutoBind()
export class AnalyticsEventListener {
  /**
   * Forwards one typed application fact to GA4 after the destination has rendered.
   *
   * Route hooks and UI components publish the same privacy-safe contract, so
   * this is the only application boundary that knows about Google. The current
   * title and URL are added here because both are reliable after a route's
   * `afterEach` hook and are useful for diagnosing the delivered event.
   */
  @OnEvent(ANALYTICS_TRACK_EVENT)
  sendToGoogle(event: ApplicationEvent<typeof ANALYTICS_TRACK_EVENT>): void {
    if (!window.gtag) {
      console.warn("Google Analytics is not available");
      return;
    }
    console.debug("AnalyticsEventListener.sendToGoogle", event);
    window.gtag("event", event.data.eventName, {
      ...event.data.params,
      page_title: document.title,
      page_location: window.location.href,
    });
  }
}
