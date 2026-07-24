import type { ShowcaseProject } from "@app/data/showcase-content.ts";

const FRONTMATTER = /^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/** Loads authored showcase Markdown from the static public content root. */
export class ShowcaseLoaderService {
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
