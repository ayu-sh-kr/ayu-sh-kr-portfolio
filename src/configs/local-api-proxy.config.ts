/**
 * Locale headers that stand in for Cloudflare's edge-derived client context during local work.
 *
 * The backend only trusts these headers at its edge boundary. Vite adds a configurable local
 * profile to proxied development requests so locale-aware endpoints can be exercised without
 * the Cloudflare worker; production requests continue to receive their values from the worker.
 */
function localClientLocaleHeaders(region: string) {
  const normalizedRegion = region.trim().toUpperCase() || "IN";
  const isIndia = normalizedRegion === "IN";

  return {
    "X-Client-Region": normalizedRegion,
    "X-Client-Country": normalizedRegion,
    "X-Client-Locale": isIndia ? "en-IN" : "en-US",
    "X-Client-Timezone": isIndia ? "Asia/Kolkata" : "America/New_York",
  };
}

/**
 * Backend paths served through Vite during local development.
 *
 * Keeping the paths beside their shared target and edge-context headers prevents one local API
 * flow from silently bypassing the context that the production Cloudflare worker provides.
 */
const localApiRoutes = [
  "/status",
  "/locale",
  "/subscriber",
  "/pricing-form",
  "/buy-coffee",
  "/razorpay",
  "/blog/view",
  "/support-ticket",
  "/support-ticket/files/upload-url",
] as const;

/**
 * Creates the Vite development proxy map for backend endpoints.
 *
 * `vite.config.ts` calls this only in development mode. Every route forwards to the supplied
 * backend target and includes the fixed local locale profile, matching the headers that the
 * backend's `ClientLocaleArgumentResolver` reads from Cloudflare-proxied production requests.
 *
 * @param target - Base URL of the backend to receive locally proxied requests.
 * @returns Vite proxy entries keyed by the backend path prefixes used by the frontend.
 */
export function createLocalApiProxy(target: string, region = "IN") {
  const options = {
    target,
    changeOrigin: true,
    headers: localClientLocaleHeaders(region),
  };

  return Object.fromEntries(localApiRoutes.map((route) => [route, options]));
}
