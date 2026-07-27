import type {BlogPost} from "@app/configs/blogs.config.ts";

/**
 * Loads authored Markdown for a blog post without coupling the route coordinator
 * to HTTP details. The caller owns the abort signal and publishes the returned
 * body through the blog application event contract.
 */
export class BlogLoaderService {
  /**
   * Fetches one post source for the route coordinator.
   *
   * @param post - Catalog entry whose root-relative `source` URL is requested.
   * @param signal - Abort signal owned by the route coordinator for stale requests.
   * @returns The raw Markdown body after a successful response.
   * @throws Error when the response is not successful; abort errors pass through unchanged.
   */
  async load(post: BlogPost, signal: AbortSignal): Promise<string> {
    const response = await fetch(encodeURI(post.source), {
      signal,
      headers: {Accept: "text/markdown,text/plain;q=0.9"},
    });
    if (!response.ok) {
      throw new Error(`Unable to load ${post.source} (${response.status})`);
    }
    return response.text();
  }
}
