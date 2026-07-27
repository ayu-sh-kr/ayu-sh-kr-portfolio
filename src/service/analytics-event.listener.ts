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
  /** Forwards one typed application fact to GA4 without sending sensitive values. */
  @OnEvent(ANALYTICS_TRACK_EVENT)
  sendToGoogle(event: ApplicationEvent<typeof ANALYTICS_TRACK_EVENT>): void {
    window.gtag?.("event", event.data.eventName, {
      ...event.data.params,
      page_location: window.location.href,
    });
  }
}
