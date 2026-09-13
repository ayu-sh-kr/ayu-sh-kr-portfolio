/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL used by the browser REST client. */
  readonly VITE_API_BASE_URL: string;

  /** Set to `v2` only after the Cloudflare proxy is verified in production; defaults to v1. */
  readonly VITE_BLOG_VIEW_API_VERSION?: "v1" | "v2";

  /** Optional development proxy target; defaults to the local backend. */
  readonly VITE_DEV_API_TARGET?: string;
}
