/**
 * Extracts the subscriber token from supported link parameter names.
 *
 * Email links use either `token` or the shorter `t` alias; callers receive an
 * empty string when neither exists and can select their invalid-link state.
 */
export function readSubscriptionToken(params: URLSearchParams): string {
  return params.get("token") || params.get("t") || "";
}

/**
 * Marks the current document as private to search crawlers.
 *
 * Token-linked pages call this before rendering. The helper reuses an existing
 * robots element or creates one, making it safe across route transitions.
 */
export function markSubscriptionNoIndex(): void {
  const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    ?? document.head.appendChild(document.createElement("meta"));
  robots.name = "robots";
  robots.content = "noindex";
}
