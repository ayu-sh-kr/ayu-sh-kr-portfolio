export {};

import type { ActionButtonSettlement, ActionButtonTrigger } from "@app/events/action-button.events.ts";
import type { AnalyticsTrackEvent } from "@app/events/analytics.events.ts";
import type { BlogFilterChange, BlogMarkdownSource } from "@app/events/blog.events.ts";
import type { CoffeeOrderQuantitySelection, CoffeeOrderSizeSelection } from "@app/events/coffee.events.ts";
import type { PricingStartProjectBrief, PricingStartProjectField, PricingStartProjectFilesChange, PricingStartProjectMode } from "@app/events/pricing.events.ts";
import type { PrivacyMarkdownRender, PrivacyMarkdownSource } from "@app/events/privacy.events.ts";
import type { ShowcaseMarkdownSource } from "@app/events/showcase.events.ts";
import type { TermsMarkdownRender, TermsMarkdownSource } from "@app/events/terms.events.ts";

// Auto-generated application event map. Do not edit by hand.
// Payload types are recovered syntactically from publish, publishAsync, and emit calls.
// Unsupported publisher expressions become unknown; decorator-only events remain any for compatibility.

declare module "@ayu-sh-kr/dota-wrap/event" {
  interface ApplicationEventMap {
    "action:refresh": { guard: string };
    "action:reject": ActionButtonSettlement;
    "action:resolve": ActionButtonSettlement;
    "action:trigger": ActionButtonTrigger;
    "analytics:track": AnalyticsTrackEvent;
    "app:initialized": null;
    "attribute-changed": any;
    "blog:filter-change": BlogFilterChange;
    "blog:markdown-source": BlogMarkdownSource;
    "coffee:order-quantity": CoffeeOrderQuantitySelection;
    "coffee:order-size": CoffeeOrderSizeSelection;
    "connected": any;
    "constructed": any;
    "disconnected": any;
    "dom-updated": any;
    "md:render": any;
    "pricing:estimator-stage": { id: string };
    "pricing:estimator-type": { id: string };
    "pricing:start-project-field": { field: PricingStartProjectField; value: string };
    "pricing:start-project-files": PricingStartProjectFilesChange;
    "pricing:start-project-mode": { mode: PricingStartProjectMode };
    "pricing:start-project-preview": PricingStartProjectBrief;
    "privacy:markdown-render": PrivacyMarkdownRender;
    "privacy:markdown-source": PrivacyMarkdownSource;
    "showcase:markdown-source": ShowcaseMarkdownSource;
    "terms:markdown-render": TermsMarkdownRender;
    "terms:markdown-source": TermsMarkdownSource;
  }
}
