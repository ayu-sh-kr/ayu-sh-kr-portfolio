import {BaseElement, Component, HostListener, HTML, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import type {TocEntry} from "@ayu-sh-kr/dota-md";
import {escapeHtml} from "@app/utils/html.utils.ts";

type FlatTocEntry = TocEntry & {depth: number};

const flattenEntries = (entries: readonly TocEntry[], depth = 0): FlatTocEntry[] =>
  entries.flatMap((entry) => [
    {...entry, depth},
    ...flattenEntries(entry.children, depth + 1),
  ]);

@Component({
  selector: "showcase-toc",
  shadow: false,
})
export class ShowcaseTocComponent extends BaseElement {
  constructor() {
    super();
  }

  private entries: readonly TocEntry[] = [];
  private activeId = "";

  @OnEvent("md:render")
  onMarkdownRender(event: ApplicationEvent<"md:render">): void {
    this.entries = event.data?.toc ?? [];
    this.activeId = this.visibleEntries()[0]?.id ?? "";
    this.updateHTML();
  }

  @WindowListener({event: "scroll"})
  onScroll(): void {
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
  onTocClick(event: MouseEvent): void {
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

  private visibleEntries(): FlatTocEntry[] {
    return flattenEntries(this.entries).filter((entry) => entry.level === 2);
  }

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
