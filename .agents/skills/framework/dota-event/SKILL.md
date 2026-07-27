---
name: dota-event
description: Use when adding or reviewing Dota application events, typed publisher/listener flows, @OnEvent handlers, @AutoBind services, event-map declarations, or analytics instrumentation in this portfolio.
---

# Dota Event

Use this skill when behavior crosses component or service boundaries through the Dota event bus. It covers the typed event contract, publisher/listener ownership, decorator registration, lifecycle-safe binding, and the generated `src/event-map.d.ts` integration.

## Core API

Import event types and decorators from `@ayu-sh-kr/dota-wrap/event`; obtain application-wide publisher and listener facades from the shared core service:

```ts
import {ApplicationEventService} from "@ayu-sh-kr/dota-wrap/core";
import {ApplicationEvent, AutoBind, OnEvent} from "@ayu-sh-kr/dota-wrap/event";

const publisher = ApplicationEventService.getInstance().getPublisher();
void publisher.publishAsync({name: EVENT_NAME, data: payload});
```

Use declaration merging for the event payload contract. Keep authored event names and payload types in `src/events/*.events.ts`; the generator updates `src/event-map.d.ts` from publisher calls.

```ts
export const PROJECT_OPENED_EVENT = "analytics:project-opened";

export type ProjectOpened = {
  /** Stable slug used by the destination route. */
  slug: string;
  /** Surface from which the visitor opened the project. */
  surface: "showcase" | "blog";
};
```

## Decorated listeners

Use `@OnEvent(name)` on component methods when the component owns the subscription. Use `@OnEvent(name, true)` for a component-scoped subscription managed by the component lifecycle.

For a regular service or class, use `@AutoBind()` so its non-scoped handlers are registered against the global listener:

```ts
@AutoBind()
export class AnalyticsEventListener {
  @OnEvent(ANALYTICS_EVENT)
  sendToGoogle(event: ApplicationEvent<typeof ANALYTICS_EVENT>): void {
    window.gtag?.("event", event.data.name, event.data.params);
  }
}
```

The class must be instantiated only after `DefaultApplicationEventListenerRegistry.setListener(...)` runs in application bootstrap. Constructing an `@AutoBind` class earlier throws because there is no global listener to bind against.

For explicit lifecycle control, use `DefaultClassApplicationEventBindManager` with the listener and call `bind()`/`unbind()`. Use `EventChannel` when a feature needs namespaced events rather than the application-wide channel.

## Analytics workflow

Keep analytics events meaningful and sparse. Prefer one typed application event for the analytics boundary, with a small union of business-relevant event names and parameter shapes. Components publish facts; the listener owns the Google-specific `gtag` call.

Track route views through the router’s global `afterEach` hook. Add event-bus analytics only for high-value actions such as contact CTA clicks, project/article opens, subscription submission outcomes, and meaningful section visibility. Do not track every decorative click, scroll tick, filter repaint, or lifecycle event.

Use stable parameter values rather than visible copy so dashboards survive content edits. Never publish email addresses, form values, message text, or other personal data.

## Implementation checklist

- Define event constants and payload types in `src/events` with explanatory TSDoc.
- Publish through `ApplicationEventService.getInstance().getPublisher()` from the user-action owner.
- Register one application listener after the bootstrap listener registry is initialized.
- Keep `gtag` integration out of UI components and keep event handlers side-effect focused.
- Use `satisfies` for payload literals so event-map generation and TypeScript both see the contract.
- Run the app build so the generated event map and custom-element metadata stay current.
