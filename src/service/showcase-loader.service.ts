import type { ShowcaseProject } from "@app/data/showcase-content.ts";

const FRONTMATTER = /^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/**
 * Loads authored showcase Markdown from the static public content root.
 *
 * The service keeps network access and frontmatter removal out of the view. Its
 * caller supplies an abort signal so route teardown or a newer request can stop
 * work before stale content reaches the Markdown event flow.
 */
export class ShowcaseLoaderService {
  /**
   * Fetches one project's Markdown and removes its leading frontmatter block.
   *
   * @param project - Catalog entry whose root-relative `source` is requested.
   * @param signal - Abort signal owned by the requesting showcase view.
   * @returns The authored Markdown body without YAML frontmatter.
   * @throws Error when the response is not successful; abort errors propagate
   *         so the caller can distinguish cancellation from a load failure.
   */
  async load(project: ShowcaseProject, signal: AbortSignal): Promise<string> {
    const response = await fetch(encodeURI(project.source), {
      signal,
      headers: { Accept: "text/markdown,text/plain;q=0.9" },
    });
    if (!response.ok) {
      throw new Error(`Unable to load ${project.source} (${response.status})`);
    }

    return (await response.text()).replace(FRONTMATTER, "");
  }
}
