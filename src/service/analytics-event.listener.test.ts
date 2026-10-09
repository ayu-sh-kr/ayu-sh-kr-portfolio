import {afterEach, expect, it, vi} from "vitest";
import {AnalyticsEventListener} from "./analytics-event.listener.ts";

afterEach(() => { delete window.gtag; });

it("omits email-link tokens from the application event URL", () => {
  window.history.replaceState({}, "", "/subscription/verify?token=secret#private");
  window.gtag = vi.fn();
  const event = {
    name: "analytics:track",
    data: {eventName: "form_success", params: {form_name: "blog_subscription"}},
  } as Parameters<AnalyticsEventListener["sendToGoogle"]>[0];
  AnalyticsEventListener.prototype.sendToGoogle(event);
  expect(window.gtag).toHaveBeenCalledWith("event", "form_success", {
    form_name: "blog_subscription",
    page_title: document.title,
    page_location: `${window.location.origin}/subscription/verify`,
  });
});

it("allows the app to run when the Google tag is unavailable", () => {
  const event = {
    name: "analytics:track",
    data: {eventName: "form_success", params: {form_name: "blog_subscription"}},
  } as Parameters<AnalyticsEventListener["sendToGoogle"]>[0];
  expect(() => AnalyticsEventListener.prototype.sendToGoogle(event)).not.toThrow();
});
