/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Build-time archive pagination override, shared by the client and static renderer. */
  readonly VITE_ARCHIVE_PAGINATION_VARIANT?: "index-lens" | "date-reel" | "story-stack";

  /** Base URL used by the browser REST client. */
  readonly VITE_API_BASE_URL: string;

  /** Set to `v2` only after the Cloudflare proxy is verified in production; defaults to v1. */
  readonly VITE_RAZORPAY_CHECKOUT_MODE?: "checkout" | "payment-link";

  /** Optional development proxy target; defaults to the local backend. */
  readonly VITE_DEV_API_TARGET?: string;
  /** Region simulated by the development API proxy; defaults to India. */
  readonly VITE_DEV_CLIENT_REGION?: string;
}
