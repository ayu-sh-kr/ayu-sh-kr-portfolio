export {};

import type { AnalyticsTrackEvent } from "@app/events/analytics.events.ts";
import type { BlogFilterChange, BlogIndexData, BlogMarkdownSource } from "@app/events/blog.events.ts";
import type { PricingStartProjectField, PricingStartProjectMode } from "@app/events/pricing.events.ts";
import type { PrivacyMarkdownRender, PrivacyMarkdownSource } from "@app/events/privacy.events.ts";
import type { ShowcaseMarkdownSource } from "@app/events/showcase.events.ts";
import type { TermsMarkdownRender, TermsMarkdownSource } from "@app/events/terms.events.ts";

// Auto-generated application event map. Do not edit by hand.
// Payload types are recovered syntactically from publish, publishAsync, and emit calls.
// Unsupported publisher expressions become unknown; decorator-only events remain any for compatibility.

declare module "@ayu-sh-kr/dota-wrap/event" {
  interface ApplicationEventMap {
    "analytics:track": AnalyticsTrackEvent;
    "app:initialized": null;
    "attribute-changed": any;
    "blog:filter-change": BlogFilterChange;
    "blog:index-data": BlogIndexData;
    "blog:markdown-source": BlogMarkdownSource;
    "connected": any;
    "constructed": any;
    "disconnected": any;
    "dom-updated": any;
    "md:render": any;
    "pricing:estimator-stage": { id: string };
    "pricing:estimator-type": { id: string };
    "pricing:start-project-field": { field: PricingStartProjectField; value: string };
    "pricing:start-project-mode": { mode: PricingStartProjectMode };
    "privacy:markdown-render": PrivacyMarkdownRender;
    "privacy:markdown-source": PrivacyMarkdownSource;
    "showcase:markdown-source": ShowcaseMarkdownSource;
    "terms:markdown-render": TermsMarkdownRender;
    "terms:markdown-source": TermsMarkdownSource;
  }
}
