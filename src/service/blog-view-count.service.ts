import {AppStorage} from "@app/service/storage.service.ts";

const BLOG_VIEW_TRACKING_TTL_MS = 5 * 60 * 1000;
const blogViewTrackingStorage = AppStorage.scope("blog-view-tracking");

/** Aggregate count returned after the backend records a blog-view tracking request. */
export interface BlogViewCountResponse {
  /** Stable blog identifier supplied by the page route. */
  slug: string;
  /** Persisted aggregate count after the tracking transaction completes. */
  viewCount: number;
}

/** Error raised when the view-tracking endpoint cannot provide a valid response. */
export class BlogViewCountApiError extends Error {
  constructor(public readonly status: number, message = "Blog view tracking is unavailable.") {
    super(message);
    this.name = "BlogViewCountApiError";
  }
}

/** Privacy-safe categories used to record tracking failures without sending error details to GA4. */
export type BlogViewTrackingFailureReason = "network" | "client" | "server" | "invalid_response";

/** Maps transport failures to the small, stable analytics contract. */
export function toBlogViewTrackingFailureReason(error: unknown): BlogViewTrackingFailureReason {
  if (!(error instanceof BlogViewCountApiError)) {
    return "network";
  }
  if (error.status === 0) {
    return "invalid_response";
  }
  if (error.status >= 500) {
    return "server";
  }
  return "client";
}

/** Fails fast for unavailable backend responses before payload conversion. */
function rejectServerFailure(response: { status: number }): void {
  if (response.status >= 500) {
    throw new BlogViewCountApiError(response.status);
  }
}

/** Narrows the public tracking response so malformed metrics do not reach page code. */
function toBlogViewCountResponse(data: unknown): BlogViewCountResponse {
  if (!data || typeof data !== "object") {
    throw new BlogViewCountApiError(0, "The blog view response was invalid.");
  }

  const payload = data as { slug?: unknown; viewCount?: unknown };
  if (typeof payload.slug !== "string" || typeof payload.viewCount !== "number") {
    throw new BlogViewCountApiError(0, "The blog view response was invalid.");
  }

  return { slug: payload.slug, viewCount: payload.viewCount };
}

/**
 * Isolates the public blog-view endpoint so blog pages do not construct backend URLs themselves.
 * Page wiring can deliberately choose when to invoke this metric without duplicating encoding or
 * response validation rules.
 */
export class BlogViewCountService {
  /**
   * Records one view per blog slug every five minutes and returns the backend's aggregate count.
   *
   * The local marker is persisted only after a successful API response, allowing a failed request
   * to be retried while suppressing later successful duplicates.
   */
  async recordView(slug: string): Promise<BlogViewCountResponse | null> {
    if (blogViewTrackingStorage.has(slug)) {
      return null;
    }

    const response = await window.portfolioRestClient
      .post<BlogViewCountResponse>()
      .uri(`/blog/view?slug=${encodeURIComponent(slug)}`)
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toBlogViewCountResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300) {
      throw new BlogViewCountApiError(response.status);
    }

    blogViewTrackingStorage.set(slug, true, {ttl: BLOG_VIEW_TRACKING_TTL_MS});
    return response.data;
  }
}

export const blogViewCountService = new BlogViewCountService();
