import {BaseElement, Component, HostListener, HTML, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {TERMS_MARKDOWN_RENDER_EVENT, type TermsSection} from "@app/events/terms.events.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";

/**
 * Provides grouped navigation for the rendered terms sections.
 *
 * The Markdown view publishes section metadata after rendering. This element
 * tracks the heading nearest the reading threshold and updates its active link;
 * selecting a link updates the hash and scrolls to the corresponding heading.
 *
 * Selector: `terms-toc`.
 */
@Component({
  selector: "terms-toc",
  shadow: false,
})
export class TermsTocComponent extends BaseElement {
  /** Sections published by the terms Markdown view. */
  private sections: readonly TermsSection[] = [];
  /** ID of the section currently highlighted in the TOC. */
  private activeId = "";

  constructor() {
    super();
  }

  @OnEvent(TERMS_MARKDOWN_RENDER_EVENT)
  /** Replaces the TOC model after terms Markdown has finished rendering. */
  updateSections(event: ApplicationEvent<typeof TERMS_MARKDOWN_RENDER_EVENT>): void {
    this.sections = event.data.sections;
    this.activeId = this.sections[0]?.id ?? "";
    this.updateHTML();
  }

  @WindowListener({event: "scroll"})
  /** Keeps the active link aligned with the section nearest the reading threshold. */
  syncActiveSection(): void {
    let nextActiveId = this.sections[0]?.id ?? "";
    this.sections.forEach((section) => {
      const heading = document.getElementById(section.id);
      if (heading && heading.getBoundingClientRect().top <= 144) {
        nextActiveId = section.id;
      }
    });
    if (nextActiveId === this.activeId) {
      return;
    }
    this.activeId = nextActiveId;
    this.updateHTML();
  }

  @HostListener({event: "click"})
  /** Smooth-scrolls to a valid section selected from the delegated TOC links. */
  scrollToSection(event: MouseEvent): void {
    const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("[data-terms-toc-id]");
    const id = link?.dataset.termsTocId;
    if (!link || !id) {
      return;
    }

    const heading = document.getElementById(id);
    if (!heading) {
      return;
    }

    event.preventDefault();
    window.history.replaceState(null, "", `#${id}`);
    heading.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    this.activeId = id;
    this.updateHTML();
  }

  /** Renders grouped section links or a placeholder before Markdown is ready. */
  render(): string {
    if (!this.sections.length) {
      return `<div class="terms-toc-placeholder" aria-hidden="true"></div>`;
    }

    const groups: {title: string; sections: TermsSection[]}[] = [];
    this.sections.forEach((section) => {
      const group = groups.at(-1);
      if (!group || group.title !== section.group) {
        groups.push({title: section.group, sections: [section]});
        return;
      }
      group.sections.push(section);
    });
    const items = groups.map((group) => `
      <section class="terms-toc-group">
        <p class="terms-toc-group-label">${escapeHtml(group.title)}</p>
        <ol>
          ${group.sections.map((section) => `
            <li class="${section.id === this.activeId ? "is-active" : ""}">
              <a href="#${escapeHtml(section.id)}" data-terms-toc-id="${escapeHtml(section.id)}">${escapeHtml(section.short)}</a>
            </li>
          `).join("")}
        </ol>
      </section>
    `).join("");

    return HTML`
      <aside class="terms-toc-panel" aria-label="On this page">
        <p class="terms-toc-label">On this page</p>
        <nav aria-label="Terms and conditions sections">
          <div>${items}</div>
        </nav>
      </aside>
    `;
  }
}
