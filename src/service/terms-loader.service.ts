import type {TermsSection} from "@app/events/terms.events.ts";

const FRONTMATTER_PATTERN = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const AUTHORING_NOTES_PATTERN = /<!--[\s\S]*?-->\s*/g;
const SECTION_PATTERN = /^##\s+(.+?)\s+\{#([\w-]+)\s+scope="([^"]+)"\s+group="([^"]+)"\s+short="([^"]+)"\}\s*$/gm;

export type TermsMetadata = {
  title: string;
  tagline: string;
  version: string;
  updated: string;
  effective: string;
  governingLaw: string;
  jurisdiction: string;
  contact: string;
  summary: readonly string[];
  summaryNote: string;
  switches: readonly {label: string; target: string}[];
  related: readonly {title: string; href: string; blurb: string}[];
};

export type TermsDocument = {
  markdown: string;
  metadata: TermsMetadata;
  sections: readonly TermsSection[];
};

const valueFor = (frontmatter: string, key: string, fallback = ""): string => {
  const match = new RegExp(`^${key}:\\s*["']?([^\\n"']+?)["']?\\s*$`, "m").exec(frontmatter);
  return match?.[1]?.trim() ?? fallback;
};

const parseSummary = (frontmatter: string): readonly string[] => {
  const match = /^summary:\s*\r?\n((?:\s+-\s+.+\r?\n?)+)/m.exec(frontmatter);
  return match?.[1]
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^-\s+/, ""))
    .filter(Boolean) ?? [];
};

const parseSwitches = (frontmatter: string): readonly {label: string; target: string}[] =>
  [...frontmatter.matchAll(/-\s+\{\s*label:\s*([^,]+),\s*target:\s*([^}\s]+)\s*\}/g)].map((match) => ({
    label: match[1].trim(),
    target: match[2].trim(),
  }));

const parseRelated = (frontmatter: string): readonly {title: string; href: string; blurb: string}[] =>
  [...frontmatter.matchAll(/-\s+\{\s*title:\s*([^,]+),\s*href:\s*([^,]+),\s*blurb:\s*"([^"]+)"\s*\}/g)].map((match) => ({
    title: match[1].trim(),
    href: match[2].trim(),
    blurb: match[3].trim(),
  }));

const parseSections = (content: string): readonly TermsSection[] =>
  [...content.matchAll(SECTION_PATTERN)].map((match) => ({
    title: match[1].trim(),
    id: match[2],
    scope: match[3],
    group: match[4],
    short: match[5],
  }));

const normalizeMarkdown = (content: string): string =>
  content
    .replace(FRONTMATTER_PATTERN, "")
    .replace(AUTHORING_NOTES_PATTERN, "")
    .replace(SECTION_PATTERN, "## $1")
    .replace(/(\]\([^\n)]+\))\{[^}\n]+\}/g, "$1")
    .trim();

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

/** Loads and normalizes the authored terms Markdown without coupling it to the viewer. */
export class TermsLoaderService {
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