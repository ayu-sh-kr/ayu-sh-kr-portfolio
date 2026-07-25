import {BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {ApplicationEventService} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {
  applyMarkdownTheme,
  getSelectionClass,
  MDService,
  MdViewComponent,
  THEMES,
  type ColorName,
} from "@ayu-sh-kr/dota-md";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {
  PRIVACY_MARKDOWN_RENDER_EVENT,
  PRIVACY_MARKDOWN_SOURCE_EVENT,
  type PrivacyMarkdownRender,
  type PrivacySection,
} from "@app/events/privacy.events.ts";

@Component({
  selector: "privacy-markdown-view",
  shadow: false,
})
export class PrivacyMarkdownViewComponent extends MdViewComponent {
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private observer: IntersectionObserver | null = null;
  private hashFrameId: number | null = null;
  private sections: readonly PrivacySection[] = [];
  private readonly copyResetTimers = new Map<HTMLAnchorElement, number>();

  constructor() {
    super();
  }

  @BeforeInit()
  captureInitialContent(): void {
    if (!this.content) {
      this.content = this.innerHTML;
    }
  }

  @OnEvent(PRIVACY_MARKDOWN_SOURCE_EVENT)
  onMarkdownSource(event: ApplicationEvent<typeof PRIVACY_MARKDOWN_SOURCE_EVENT>): void {
    this.sections = event.data.sections;
    MDService.render(event.data.markdown, {publish: true});
  }

  @OnEvent("md:render")
  override onContentChange(event: ApplicationEvent<"md:render">): void {
    super.onContentChange(event);
    const content = this.querySelector<HTMLElement>(".privacy-markdown-content");
    if (!content) {
      return;
    }

    this.decorateSections(content);
    this.decorateTables(content);
    this.setupReveals();
    this.closest("[data-privacy-markdown]")?.setAttribute("aria-busy", "false");
    void this.publisher.publishAsync({
      name: PRIVACY_MARKDOWN_RENDER_EVENT,
      data: {sections: this.sections} satisfies PrivacyMarkdownRender,
    });

    const headingId = this.currentHash();
    if (headingId) {
      this.hashFrameId = requestAnimationFrame(() => {
        this.hashFrameId = null;
        document.getElementById(headingId)?.scrollIntoView();
      });
    }
  }

  @BindEvent({event: "click", id: "[data-privacy-anchor]"})
  async onAnchorClick(event: Event): Promise<void> {
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("[data-privacy-anchor]");
    if (!anchor) {
      return;
    }

    event.preventDefault();
    const id = anchor.dataset.privacyAnchor ?? "";
    window.history.replaceState(null, "", `#${id}`);
    try {
      await navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
    } catch {
      // The anchor still updates the URL when clipboard access is unavailable.
    }
    anchor.textContent = "Copied";

    const previousTimer = this.copyResetTimers.get(anchor);
    if (previousTimer !== undefined) {
      window.clearTimeout(previousTimer);
    }
    const timer = window.setTimeout(() => {
      this.copyResetTimers.delete(anchor);
      anchor.textContent = "#";
    }, 1400);
    this.copyResetTimers.set(anchor, timer);
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.copyResetTimers.forEach((timer) => window.clearTimeout(timer));
    this.copyResetTimers.clear();
    if (this.hashFrameId !== null) {
      cancelAnimationFrame(this.hashFrameId);
      this.hashFrameId = null;
    }
  }

  private decorateSections(content: HTMLElement): void {
    const headings = [...content.querySelectorAll<HTMLHeadingElement>("h2")];
    headings.forEach((heading, index) => {
      const section = this.sections[index];
      if (!section) {
        return;
      }

      heading.id = section.id;
      heading.dataset.privacyHeading = section.id;
      const number = document.createElement("span");
      number.className = "privacy-section-number";
      number.textContent = String(index + 1).padStart(2, "0");
      heading.prepend(number);

      const anchor = document.createElement("a");
      anchor.className = "privacy-section-anchor";
      anchor.href = `#${section.id}`;
      anchor.dataset.privacyAnchor = section.id;
      anchor.setAttribute("aria-label", `Link to ${section.title}`);
      anchor.textContent = "#";
      heading.append(anchor);
    });

    const children = [...content.children];
    headings.forEach((heading, index) => {
      const section = this.sections[index];
      if (!section) {
        return;
      }

      const wrapper = document.createElement("section");
      wrapper.className = "privacy-section privacy-reveal";
      wrapper.id = `privacy-section-${section.id}`;
      wrapper.dataset.group = section.group;
      wrapper.dataset.scope = section.scope;
      wrapper.dataset.short = section.short;
      heading.parentElement?.insertBefore(wrapper, heading);

      const chip = document.createElement("span");
      chip.className = "privacy-audience-chip";
      chip.textContent = section.scope;
      wrapper.append(chip);

      const start = children.indexOf(heading);
      const end = headings[index + 1] ? children.indexOf(headings[index + 1]) : children.length;
      children.slice(start, end).forEach((child) => wrapper.append(child));
    });
  }

  private decorateTables(content: HTMLElement): void {
    content.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
      const labels = [...table.querySelectorAll<HTMLTableCellElement>("thead th")].map((cell) => cell.textContent?.trim() ?? "");
      table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
        [...row.cells].forEach((cell, index) => {
          if (labels[index]) {
            cell.dataset.label = labels[index];
          }
        });
      });
    });
  }

  private setupReveals(): void {
    this.observer?.disconnect();
    const sections = [...this.querySelectorAll<HTMLElement>(".privacy-reveal")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-revealed"));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-revealed");
        this.observer?.unobserve(entry.target);
      });
    }, {threshold: 0.08});
    sections.forEach((section) => this.observer?.observe(section));
  }

  private currentHash(): string {
    const hash = window.location.hash.slice(1);
    try {
      return decodeURIComponent(hash);
    } catch {
      return "";
    }
  }

  override render(): string {
    const themeName = this.getAttribute("theme") ?? portfolioMarkdownTheme.name;
    const colorName = (this.getAttribute("color") ?? portfolioMarkdownColor) as ColorName;
    const theme = THEMES[themeName] ?? portfolioMarkdownTheme;
    const themedContent = this.content ? applyMarkdownTheme(this.content, theme, colorName) : "";

    return `
      <div class="privacy-markdown-content ${getSelectionClass(theme, colorName)}"
           style="font-family: ${theme.fontFamily},serif">
        ${themedContent}
      </div>
    `;
  }
}
