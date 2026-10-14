import {BaseElement, BeforeInit, Component, HostListener, HTML, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import type {TocEntry} from "@ayu-sh-kr/dota-md";
import {escapeHtml} from "@app/utils/html.utils.ts";

/** A table-of-contents entry flattened with its nesting depth for navigation. */
type FlatTocEntry = TocEntry & {depth: number};

/** Flattens nested Markdown headings while preserving their document order. */
const flattenEntries = (entries: readonly TocEntry[], depth = 0): FlatTocEntry[] =>
  entries.flatMap((entry) => [
    {...entry, depth},
    ...flattenEntries(entry.children, depth + 1),
  ]);

/**
 * Shows the active level-two headings for a rendered showcase case study.
 *
 * It takes fresh TOC data from the `md:render` event that
 * `showcase-markdown-view` publishes after rendering, tracks the heading nearest
 * the reading threshold during scroll, and smooth-scrolls to a heading when a
 * reader selects a link. A prerendered article publishes no `md:render`, so its
 * entries are read from the SSG headings before the first client render. Short articles intentionally render a
 * placeholder instead of an empty navigation panel.
 *
 * Selector: `showcase-toc`.
 */
@Component({
  selector: "showcase-toc",
  shadow: false,
})
export class ShowcaseTocComponent extends BaseElement {
  constructor() {
    super();
  }

  /** TOC tree published by the Markdown renderer for the current article. */
  private entries: readonly TocEntry[] = [];
  /** Heading ID currently highlighted in the compact navigation. */
  private activeId = "";

  /**
   * Seeds entries from prerendered headings so a hydrated article keeps its TOC.
   *
   * Runs before the first render. The SSG Markdown is already in the document,
   * so its `h2[id]` headings yield the same level-two entries the renderer would
   * publish. On client navigation no content exists yet and the list stays
   * empty until `md:render` arrives.
   */
  @BeforeInit()
  beforeViewInit(): void {
    const headings = document.querySelectorAll<HTMLHeadingElement>("[data-showcase-markdown] .showcase-markdown-content h2[id]");
    this.entries = [...headings].map((heading) => ({
      level: 2,
      text: heading.textContent?.trim() ?? "",
      id: heading.id,
      children: [],
    }));
    this.activeId = this.visibleEntries()[0]?.id ?? "";
  }

  @OnEvent("md:render")
  /** Replaces the navigation model after Markdown has rendered a new article. */
  updateEntries(event: ApplicationEvent<"md:render">): void {
    this.entries = event.data?.toc ?? [];
    this.activeId = this.visibleEntries()[0]?.id ?? "";
    this.updateHTML();
  }

  @WindowListener({event: "scroll"})
  /** Keeps the active link aligned with the heading nearest the reading threshold. */
  syncActiveEntry(): void {
    const entries = this.visibleEntries();
    let nextActiveId = entries[0]?.id ?? "";
    entries.forEach((entry) => {
      const heading = document.getElementById(entry.id);
      if (heading && heading.getBoundingClientRect().top <= 144) {
        nextActiveId = entry.id;
      }
    });
    if (nextActiveId === this.activeId) {
      return;
    }
    this.activeId = nextActiveId;
    this.updateHTML();
  }

  @HostListener({event: "click"})
  /** Smooth-scrolls to a valid heading selected from the delegated TOC links. */
  scrollToEntry(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>("[data-showcase-toc-id]");
    if (!link) {
      return;
    }

    const heading = document.getElementById(link.dataset.showcaseTocId ?? "");
    if (!heading) {
      return;
    }

    event.preventDefault();
    const top = heading.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({top, behavior: "smooth"});
    this.activeId = link.dataset.showcaseTocId ?? "";
    this.updateHTML();
  }

  /** Returns the level-two headings used by the showcase's compact TOC. */
  private visibleEntries(): FlatTocEntry[] {
    return flattenEntries(this.entries).filter((entry) => entry.level === 2);
  }

  /** Renders the TOC or an intentionally empty placeholder for short articles. */
  render(): string {
    const entries = this.visibleEntries();
    if (entries.length < 3) {
      return `<div class="showcase-toc-placeholder" aria-hidden="true"></div>`;
    }

    return HTML`
      <aside class="showcase-toc-panel" aria-label="On this page">
        <p class="showcase-toc-label">On this page</p>
        <nav aria-label="Showcase sections">
          <ol>
            ${entries
              .map(
                (entry) => `
                  <li class="${entry.id === this.activeId ? "is-active" : ""}">
                    <a href="#${escapeHtml(entry.id)}" data-showcase-toc-id="${escapeHtml(entry.id)}">
                      ${escapeHtml(entry.text)}
                    </a>
                  </li>
                `,
              )
              .join("")}
          </ol>
        </nav>
      </aside>
    `;
  }
}
