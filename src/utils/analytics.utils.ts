import {ApplicationEventService} from "@ayu-sh-kr/dota-wrap/core";
import {ANALYTICS_TRACK_EVENT, type AnalyticsTrackEvent} from "@app/events/analytics.events.ts";

/** Sends an application analytics fact through Dota's typed publisher. */
const publisher = ApplicationEventService.getInstance().getPublisher();

/**
 * Publishes one privacy-safe analytics fact for the application listener.
 *
 * UI components call this function after a meaningful user action. The Google
 * integration stays outside those components, so changing providers later only
 * requires changing the listener rather than every button and form.
 *
 * @param event - Stable event name and non-sensitive parameters to forward.
 */
export const publishAnalyticsEvent = (event: AnalyticsTrackEvent): void => {
  void publisher.publishAsync({
    name: ANALYTICS_TRACK_EVENT,
    data: event satisfies AnalyticsTrackEvent,
  });
};
