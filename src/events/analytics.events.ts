/** Single application event consumed by the Google Analytics bridge. */
export const ANALYTICS_TRACK_EVENT = "analytics:track" as const;

/** Contact destinations that are useful as conversion signals. */
export type AnalyticsContactMethod = "email" | "resume" | "call" | "github" | "linkedin";

const ANALYTICS_CONTACT_METHODS: readonly AnalyticsContactMethod[] = ["email", "resume", "call", "github", "linkedin"];

/** Stable UI surfaces used to group conversion and navigation events. */
export type AnalyticsSurface =
  | "home_contact"
  | "pricing_contact"
  | "showcase_cta"
  | "home_work"
  | "blog_index"
  | "showcase_index"
  | "blog_article"
  | "showcase_article";

/** Top-level sections whose visibility indicates meaningful page consumption. */
export type AnalyticsSection =
  | "home_hero"
  | "home_work"
  | "home_contact"
  | "blog_featured"
  | "blog_archive"
  | "blog_subscription"
  | "showcase_support"
  | "pricing_estimator"
  | "pricing_contact";

/** Blog or showcase content opened from a listing or related navigation. */
export type AnalyticsProjectKind = "blog" | "showcase";

/** Accepts only contact destinations declared in the analytics contract. */
export const isAnalyticsContactMethod = (value: string | undefined): value is AnalyticsContactMethod =>
  value != null && ANALYTICS_CONTACT_METHODS.includes(value as AnalyticsContactMethod);

/**
 * Typed facts that the application can send to the analytics bridge.
 *
 * Components publish these facts through {@link ANALYTICS_TRACK_EVENT}; the
 * analytics listener converts the discriminated payload into a GA4 event. The
 * values describe user intent and content identity, never form contents or PII.
 */
export type AnalyticsTrackEvent =
  | {
      /** Identifies a contact or profile destination selected by the visitor. */
      eventName: "contact_click";
      /** Conversion destination and the surface that presented it. */
      params: {
        /** Contact destination selected by the visitor. */
        method: AnalyticsContactMethod;
        /** Stable surface identifier, not visible copy. */
        surface: AnalyticsSurface;
      };
    }
  | {
      /** Identifies a non-contact conversion action selected by the visitor. */
      eventName: "cta_click";
      /** Stable action and surface used to group the conversion signal. */
      params: {
        /** Action represented by the CTA. */
        action: "conversation" | "pricing";
        /** Stable surface identifier, not visible copy. */
        surface: "showcase_cta";
      };
    }
  | {
      /** Identifies a blog article or showcase case study opened by the visitor. */
      eventName: "project_open";
      /** Content identity and source surface used for attribution. */
      params: {
        /** Whether the destination is a blog article or showcase project. */
        kind: AnalyticsProjectKind;
        /** Stable route slug for the selected content. */
        slug: string;
        /** Stable surface identifier, not visible copy. */
        surface: AnalyticsSurface;
      };
    }
  | {
      /** Identifies a subscription form submission attempt. */
      eventName: "subscription_submit";
      /** Form state and stable form location. */
      params: {
        /** Current outcome observed at submit time. */
        status: "submitted";
        /** Stable surface identifier for the subscription form. */
        surface: "blog_index";
      };
    }
  | {
      /** Identifies a meaningful section entering the viewport. */
      eventName: "section_view";
      /** Section identity and route path used for grouping. */
      params: {
        /** Stable section identifier from `data-analytics-section`. */
        section: AnalyticsSection;
        /** Route pathname without query parameters or hash fragments. */
        page_path: string;
      };
    };

const ANALYTICS_SECTIONS: readonly AnalyticsSection[] = [
  "home_hero",
  "home_work",
  "home_contact",
  "blog_featured",
  "blog_archive",
  "blog_subscription",
  "showcase_support",
  "pricing_estimator",
  "pricing_contact",
];

/** Accepts only section names that the analytics tracker is allowed to publish. */
export const isAnalyticsSection = (value: string | undefined): value is AnalyticsSection =>
  value != null && ANALYTICS_SECTIONS.includes(value as AnalyticsSection);
