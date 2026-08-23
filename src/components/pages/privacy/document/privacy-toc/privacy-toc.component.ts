import {BaseElement, Component, HostListener, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {PRIVACY_MARKDOWN_RENDER_EVENT, type PrivacySection} from "@app/events/privacy.events.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";

/**
 * Provides grouped navigation for the rendered privacy policy sections.
 *
 * The Markdown view publishes section metadata after rendering. This element
 * tracks the heading nearest the reading threshold and updates its active link;
 * selecting a link updates the hash and scrolls to the corresponding heading.
 *
 * Selector: `privacy-toc`.
 */
@Component({
  selector: "privacy-toc",
  shadow: false,
})
export class PrivacyTocComponent extends BaseElement {
  /** Sections published by the privacy Markdown view. */
  private sections: readonly PrivacySection[] = [];
  /** ID of the section currently highlighted in the TOC. */
  private activeId = "";

  constructor() {
    super();
  }

  @OnEvent(PRIVACY_MARKDOWN_RENDER_EVENT)
  /** Replaces the TOC model after privacy Markdown has finished rendering. */
  updateSections(event: ApplicationEvent<typeof PRIVACY_MARKDOWN_RENDER_EVENT>): void {
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
    const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("[data-privacy-toc-id]");
    const id = link?.dataset.privacyTocId;
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
  render() {
    if (!this.sections.length) {
      return html`<div class="privacy-toc-placeholder" aria-hidden="true"></div>`;
    }

    const groups: {title: string; sections: PrivacySection[]}[] = [];
    this.sections.forEach((section) => {
      const group = groups.at(-1);
      if (!group || group.title !== section.group) {
        groups.push({title: section.group, sections: [section]});
        return;
      }
      group.sections.push(section);
    });
    const items = groups.map((group) => `
      <section class="privacy-toc-group">
        <p class="privacy-toc-group-label">${escapeHtml(group.title)}</p>
        <ol>
          ${group.sections.map((section) => `
            <li class="${section.id === this.activeId ? "is-active" : ""}">
              <a href="#${escapeHtml(section.id)}" data-privacy-toc-id="${escapeHtml(section.id)}">${escapeHtml(section.short)}</a>
            </li>
          `).join("")}
        </ol>
      </section>
    `).join("");

    return html`
      <aside class="privacy-toc-panel" aria-label="On this page">
        <p class="privacy-toc-label">On this page</p>
        <nav aria-label="Privacy policy sections">
          <div>${trustedHTML(items)}</div>
        </nav>
      </aside>
    `;
  }
}
