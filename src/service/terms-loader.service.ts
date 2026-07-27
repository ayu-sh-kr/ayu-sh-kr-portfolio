import type {TermsSection} from "@app/events/terms.events.ts";

const FRONTMATTER_PATTERN = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const AUTHORING_NOTES_PATTERN = /<!--[\s\S]*?-->\s*/g;
const SECTION_PATTERN = /^##\s+(.+?)\s+\{#([\w-]+)\s+scope="([^"]+)"\s+group="([^"]+)"\s+short="([^"]+)"\}\s*$/gm;

/** Frontmatter metadata used by the terms document shell and scope controls. */
export type TermsMetadata = {
  /** Terms title shown in the document header. */
  title: string;
  /** Short value proposition shown below the title. */
  tagline: string;
  /** Authored terms version label. */
  version: string;
  /** ISO date of the latest terms update. */
  updated: string;
  /** ISO date on which the current terms took effect. */
  effective: string;
  /** Governing law displayed in the terms metadata row. */
  governingLaw: string;
  /** Jurisdiction retained for the legal document model. */
  jurisdiction: string;
  /** Contact detail retained for terms-related communication. */
  contact: string;
  /** Short summary bullets shown before the full terms. */
  summary: readonly string[];
  /** Supporting note displayed below the summary bullets. */
  summaryNote: string;
  /** Audience buttons and their target section IDs. */
  switches: readonly {label: string; target: string}[];
  /** Related legal links shown in the terms footer. */
  related: readonly {title: string; href: string; blurb: string}[];
};

/** Normalized terms Markdown, metadata, and section navigation model. */
export type TermsDocument = {
  /** Frontmatter-free Markdown passed to the terms Markdown view. */
  markdown: string;
  /** Header and scope metadata parsed from frontmatter. */
  metadata: TermsMetadata;
  /** Section metadata parsed from authored heading attributes. */
  sections: readonly TermsSection[];
};

/** Reads one scalar value from legal-document frontmatter with a fallback. */
const valueFor = (frontmatter: string, key: string, fallback = ""): string => {
  const match = new RegExp(`^${key}:\\s*["']?([^\\n"']+?)["']?\\s*$`, "m").exec(frontmatter);
  return match?.[1]?.trim() ?? fallback;
};

/** Parses the repeated summary bullet block from terms frontmatter. */
const parseSummary = (frontmatter: string): readonly string[] => {
  const match = /^summary:\s*\r?\n((?:\s+-\s+.+\r?\n?)+)/m.exec(frontmatter);
  return match?.[1]
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^-\s+/, ""))
    .filter(Boolean) ?? [];
};

/** Parses audience switch labels and target section IDs from frontmatter. */
const parseSwitches = (frontmatter: string): readonly {label: string; target: string}[] =>
  [...frontmatter.matchAll(/-\s+\{\s*label:\s*([^,]+),\s*target:\s*([^}\s]+)\s*\}/g)].map((match) => ({
    label: match[1].trim(),
    target: match[2].trim(),
}));

/** Parses related legal links from terms frontmatter. */
const parseRelated = (frontmatter: string): readonly {title: string; href: string; blurb: string}[] =>
  [...frontmatter.matchAll(/-\s+\{\s*title:\s*([^,]+),\s*href:\s*([^,]+),\s*blurb:\s*"([^"]+)"\s*\}/g)].map((match) => ({
    title: match[1].trim(),
    href: match[2].trim(),
    blurb: match[3].trim(),
}));

/** Extracts section metadata from the authored heading attributes. */
const parseSections = (content: string): readonly TermsSection[] =>
  [...content.matchAll(SECTION_PATTERN)].map((match) => ({
    title: match[1].trim(),
    id: match[2],
    scope: match[3],
    group: match[4],
    short: match[5],
}));

/** Removes frontmatter, authoring comments, and heading attributes for rendering. */
const normalizeMarkdown = (content: string): string =>
  content
    .replace(FRONTMATTER_PATTERN, "")
    .replace(AUTHORING_NOTES_PATTERN, "")
    .replace(SECTION_PATTERN, "## $1")
    .replace(/(\]\([^\n)]+\))\{[^}\n]+\}/g, "$1")
    .trim();

/** Builds the normalized terms document consumed by the view. */
const parseDocument = (source: string): TermsDocument => {
  const frontmatter = source.match(FRONTMATTER_PATTERN)?.[1] ?? "";
  const content = source.replace(FRONTMATTER_PATTERN, "");

  return {
    markdown: normalizeMarkdown(source),
    sections: parseSections(content),
    metadata: {
      title: valueFor(frontmatter, "title", "Terms & Conditions"),
      tagline: valueFor(frontmatter, "tagline"),
      version: valueFor(frontmatter, "version"),
      updated: valueFor(frontmatter, "updated"),
      effective: valueFor(frontmatter, "effective"),
      governingLaw: valueFor(frontmatter, "governing_law"),
      jurisdiction: valueFor(frontmatter, "jurisdiction"),
      contact: valueFor(frontmatter, "contact"),
      summary: parseSummary(frontmatter),
      summaryNote: valueFor(frontmatter, "summary_note"),
      switches: parseSwitches(frontmatter),
      related: parseRelated(frontmatter),
    },
  };
};

/**
 * Loads and normalizes authored terms Markdown without coupling it to the viewer.
 *
 * The view owns the abort signal and then publishes the returned document to its
 * Markdown child, keeping fetch, parsing, and rendering responsibilities separate.
 */
export class TermsLoaderService {
  /** Fetches the legal Markdown and returns its parsed document model. */
  async load(signal: AbortSignal): Promise<TermsDocument> {
    const response = await fetch("/legal/terms.md", {
      signal,
      headers: {Accept: "text/markdown,text/plain;q=0.9"},
    });
    if (!response.ok) {
      throw new Error(`Unable to load the terms and conditions (${response.status})`);
    }

    return parseDocument(await response.text());
  }
}
