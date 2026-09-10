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

/**
 * Stable route identities used to compare page-level engagement in GA4.
 *
 * These values intentionally describe the route role rather than copying the
 * current document title. Detail pages use the same category for every slug;
 * the slug is carried separately in the page-view parameters.
 */
export type AnalyticsPage =
  | "home"
  | "pricing"
  | "coffee"
  | "support"
  | "blog"
  | "blog_article"
  | "showcase"
  | "showcase_article"
  | "terms"
  | "privacy"
  | "offline"
  | "error";

/**
 * Visible surfaces whose appearance indicates meaningful page consumption.
 *
 * Components opt in by setting `data-analytics-section`. The section tracker
 * publishes one event per route and section after the element enters the
 * viewport, keeping scroll noise out of the analytics stream.
 */
export type AnalyticsSection =
  | "home_hero"
  | "home_journey"
  | "home_work"
  | "home_speaking"
  | "home_skills"
  | "home_services"
  | "home_contact"
  | "pricing_hero"
  | "pricing_offering"
  | "blog_featured"
  | "blog_archive"
  | "blog_subscription"
  | "blog_article"
  | "showcase_hero"
  | "showcase_projects"
  | "showcase_support"
  | "showcase_article"
  | "pricing_estimator"
  | "pricing_faq"
  | "pricing_contact"
  | "terms_document"
  | "privacy_document";

/** Blog or showcase content opened from a listing or related navigation. */
export type AnalyticsProjectKind = "blog" | "showcase";

/** Stable identities for the portfolio's pullable card-deck surfaces. */
export type AnalyticsCardDeck = "showcase" | "about_me" | "reach_out";

/** Input used to change the active card. */
export type AnalyticsCardDeckInput = "pointer" | "button" | "keyboard" | "card_picker";

/** Stable destination roles for links embedded within a card deck. */
export type AnalyticsCardDeckLink = "cta" | "profile" | "project" | "content" | "home";

const ANALYTICS_CARD_DECK_LINKS: readonly AnalyticsCardDeckLink[] = ["cta", "profile", "project", "content", "home"];

/**
 * Narrows a deck-link data attribute to the roles supported by the analytics contract.
 *
 * The shared card-deck lifecycle service calls this before publishing a link event, preventing
 * unmarked or misspelled content attributes from creating an uncontrolled GA4 dimension.
 *
 * @param value - Raw `data-card-deck-link` value read from the clicked anchor.
 * @returns Whether the value is a stable card-deck link role.
 */
export const isAnalyticsCardDeckLink = (value: string | undefined): value is AnalyticsCardDeckLink =>
  value != null && ANALYTICS_CARD_DECK_LINKS.includes(value as AnalyticsCardDeckLink);

/** Stable identifiers for forms whose completed submissions are measured. */
export type AnalyticsFormName = "blog_subscription";

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
      /** Records a completed route view after the destination metadata is rendered. */
      eventName: "page_view";
      /** Route identity and optional content slug used to segment page engagement. */
      params: {
        /** Stable route category, independent of the visible page title. */
        page: AnalyticsPage;
        /** Browser pathname without query parameters or hash fragments. */
        page_path: string;
        /** Blog or showcase slug when the route is a content detail page. */
        slug?: string;
      };
    }
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
      /** Identifies a meaningful section entering the viewport. */
      eventName: "section_view";
      /** Section identity and route path used for grouping. */
      params: {
        /** Stable section identifier from `data-analytics-section`. */
        section: AnalyticsSection;
        /** Route pathname without query parameters or hash fragments. */
        page_path: string;
      };
    }
  | {
      /** Records one completed pointer pull, including pulls that settle back. */
      eventName: "card_deck_swipe";
      /** Gesture depth is reported once on release instead of for every pointer move. */
      params: {
        /** Deck that received the gesture. */
        deck: AnalyticsCardDeck;
        /** One-based card position at which the pull began. */
        card: number;
        /** Number of cards available in the deck. */
        card_count: number;
        /** Absolute horizontal pull distance, rounded to whole CSS pixels. */
        distance_pixels: number;
        /** Pull distance as a percentage of the commit threshold, capped at 200%. */
        progress_percent: number;
        /** Whether the pull advanced to the next card. */
        completed: boolean;
      };
    }
  | {
      /** Records a card-position change from any supported navigation input. */
      eventName: "card_deck_navigation";
      /** Position and input data used to measure deck consumption. */
      params: {
        /** Deck whose active card changed. */
        deck: AnalyticsCardDeck;
        /** Input that caused the position change. */
        input: AnalyticsCardDeckInput;
        /** One-based position before the navigation. */
        from_card: number;
        /** One-based position after the navigation. */
        to_card: number;
        /** Number of cards available in the deck. */
        card_count: number;
        /** Highest one-based card position seen during this visit. */
        furthest_card_reached: number;
      };
    }
  | {
      /** Records a call-to-action, profile, project, or content link selected in a deck. */
      eventName: "card_deck_link_click";
      /** Stable link role and destination, with the visitor's deck progress for context. */
      params: {
        /** Deck that presented the link. */
        deck: AnalyticsCardDeck;
        /** Semantic role of the selected link. */
        link: AnalyticsCardDeckLink;
        /** Stable route path or external destination category; never visible copy. */
        destination: string;
        /** One-based active card when the link was selected. */
        card: number;
        /** Highest one-based card position seen during this visit. */
        furthest_card_reached: number;
      };
    }
  | {
      /** Records a successful hand-off from a subscription form to verification. */
      eventName: "subscribe";
      /** Stable form identity; no submitted form values are sent to analytics. */
      params: {
        /** Form that completed the subscription request. */
        form_name: AnalyticsFormName;
      };
    };

const ANALYTICS_SECTIONS: readonly AnalyticsSection[] = [
  "home_hero",
  "home_journey",
  "home_work",
  "home_speaking",
  "home_skills",
  "home_services",
  "home_contact",
  "pricing_hero",
  "pricing_offering",
  "blog_featured",
  "blog_archive",
  "blog_subscription",
  "blog_article",
  "showcase_hero",
  "showcase_projects",
  "showcase_support",
  "showcase_article",
  "pricing_estimator",
  "pricing_contact",
  "pricing_faq",
  "terms_document",
  "privacy_document",
];

/** Accepts only section names that the analytics tracker is allowed to publish. */
export const isAnalyticsSection = (value: string | undefined): value is AnalyticsSection =>
  value != null && ANALYTICS_SECTIONS.includes(value as AnalyticsSection);
