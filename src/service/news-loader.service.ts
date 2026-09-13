import type {NewsNote} from "@app/configs/news.config.ts";

/**
 * Keeps Dispatch document transport outside the permalink component.
 * The active article owns cancellation, while this service enforces the Markdown
 * request contract and turns unsuccessful responses into an explicit failure.
 */
export class NewsLoaderService {
  /** Loads the configured note body for the active `/news/:slug` route. */
  async load(note: NewsNote, signal: AbortSignal): Promise<string> {
    const response = await fetch(encodeURI(note.document), {
      signal,
      headers: {Accept: "text/markdown,text/plain;q=0.9"},
    });
    if (!response.ok) {
      throw new Error(`Unable to load ${note.document} (${response.status})`);
    }

    return response.text();
  }
}
