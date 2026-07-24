export {};

import type { BlogArticleData, BlogArticleError, BlogIndexData, BlogMarkdownSource } from "@app/events/blog.events.ts";
import type { ShowcaseMarkdownSource } from "@app/events/showcase.events.ts";

// Auto-generated application event map. Do not edit by hand.
// Payload types are recovered syntactically from publish, publishAsync, and emit calls.
// Unsupported publisher expressions become unknown; decorator-only events remain any for compatibility.

declare module "@ayu-sh-kr/dota-wrap/event" {
  interface ApplicationEventMap {
    "app:initialized": null;
    "attribute-changed": any;
    "blog:article-data": BlogArticleData;
    "blog:article-error": BlogArticleError;
    "blog:index-data": BlogIndexData;
    "blog:markdown-source": BlogMarkdownSource;
    "connected": any;
    "constructed": any;
    "disconnected": any;
    "dom-updated": any;
    "md:render": any;
    "pricing:estimator-stage": { id: string };
    "pricing:estimator-type": { id: string };
    "showcase:markdown-source": ShowcaseMarkdownSource;
  }
}
