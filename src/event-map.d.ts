import type {BlogArticleData, BlogArticleError, BlogIndexData, BlogMarkdownSource} from "@app/events/blog.events.ts";
import type {PricingEstimatorSelection} from "@app/events/pricing.events.ts";
import "@ayu-sh-kr/dota-wrap/event";

declare module "@ayu-sh-kr/dota-wrap/event" {
  interface ApplicationEventMap {
    "app:initialized": null;
    "blog:index-data": BlogIndexData;
    "blog:article-data": BlogArticleData;
    "blog:article-error": BlogArticleError;
    "blog:markdown-source": BlogMarkdownSource;
    "pricing:estimator-type": PricingEstimatorSelection;
    "pricing:estimator-stage": PricingEstimatorSelection;
  }
}

export {};
