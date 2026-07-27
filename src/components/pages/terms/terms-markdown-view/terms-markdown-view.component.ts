import {ApplicationEventService, BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MdViewComponent} from "@ayu-sh-kr/dota-md";
import {
  TERMS_MARKDOWN_RENDER_EVENT,
  TERMS_MARKDOWN_SOURCE_EVENT,
  type TermsMarkdownRender,
  type TermsSection,
} from "@app/events/terms.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/**
 * Renders the loaded terms Markdown and publishes its section model.
 *
 * `terms-view` supplies the source event after loading the legal document. This
 * adapter delegates shared Markdown lifecycle work while adding terms-specific
 * heading wrappers, section anchors, responsive tables, and reveal behavior.
 *
 * Selector: `terms-markdown-view`.
 */
@Component({
  selector: "terms-markdown-view",
  shadow: false,
})
export class TermsMarkdownViewComponent extends MdViewComponent {
  /** Shared capture, rendering, hash-scroll, and feedback lifecycle for Markdown. */
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);
  /** Publisher used to notify `terms-toc` after headings have been decorated. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  /** Section metadata matching the headings in the currently rendered document. */
  private sections: readonly TermsSection[] = [];

  constructor() {
    super();
  }

  @BeforeInit()
  /** Captures the loading placeholder before Markdown replaces the initial content. */
  captureInitialContent(): void {
    this.markdownLifecycle.captureInitialContent();
  }

  @OnEvent(TERMS_MARKDOWN_SOURCE_EVENT)
  /** Receives the loaded terms source and begins the shared Markdown render flow. */
  renderMarkdownSource(event: ApplicationEvent<typeof TERMS_MARKDOWN_SOURCE_EVENT>): void {
    this.sections = event.data.sections;
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  @OnEvent("md:render")
  /** Enhances rendered Markdown and publishes the final section model for the TOC. */
  override onContentChange(event: ApplicationEvent<"md:render">): void {
    super.onContentChange(event);
    const content = this.querySelector<HTMLElement>(".terms-markdown-content");
    if (!content) {
      return;
    }

    this.decorateSections(content);
    this.markdownLifecycle.decorateResponsiveTables(content);
    this.markdownLifecycle.setupReveals(".terms-reveal");
    this.closest("[data-terms-markdown]")?.setAttribute("aria-busy", "false");
    void this.publisher.publishAsync({
      name: TERMS_MARKDOWN_RENDER_EVENT,
      data: {sections: this.sections} satisfies TermsMarkdownRender,
    });

    this.markdownLifecycle.scheduleHashScroll();
  }

  @BindEvent({event: "click", id: "[data-terms-anchor]"})
  /** Copies a section's canonical URL while preserving the selected hash. */
  async copyAnchorLink(event: Event): Promise<void> {
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("[data-terms-anchor]");
    if (!anchor) {
      return;
    }

    event.preventDefault();
    const id = anchor.dataset.termsAnchor ?? "";
    window.history.replaceState(null, "", `#${id}`);
    try {
      await navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
    } catch {
      // The anchor still updates the URL when clipboard access is unavailable.
    }
    this.markdownLifecycle.markCopied(anchor, "Copied", "#");
  }

  @OnEvent("disconnected", true)
  /** Releases timers and listeners owned by the Markdown lifecycle helper. */
  cleanupMarkdownLifecycle(): void {
    this.markdownLifecycle.disconnect();
  }

  /** Adds IDs, numbered labels, and copyable anchors to rendered terms headings. */
  private decorateSections(content: HTMLElement): void {
    const headings = [...content.querySelectorAll<HTMLHeadingElement>("h2")];
    headings.forEach((heading, index) => {
      const section = this.sections[index];
      if (!section) {
        return;
      }

      heading.id = section.id;
      heading.dataset.termsHeading = section.id;
      const number = document.createElement("span");
      number.className = "terms-section-number";
      number.textContent = String(index + 1).padStart(2, "0");
      heading.prepend(number);

      const anchor = document.createElement("a");
      anchor.className = "terms-section-anchor";
      anchor.href = `#${section.id}`;
      anchor.dataset.termsAnchor = section.id;
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
      wrapper.className = "terms-section terms-reveal";
      wrapper.id = `terms-section-${section.id}`;
      wrapper.dataset.group = section.group;
      wrapper.dataset.scope = section.scope;
      wrapper.dataset.short = section.short;
      heading.parentElement?.insertBefore(wrapper, heading);

      const chip = document.createElement("span");
      chip.className = "terms-audience-chip";
      chip.textContent = section.scope;
      wrapper.append(chip);

      const start = children.indexOf(heading);
      const end = headings[index + 1] ? children.indexOf(headings[index + 1]) : children.length;
      children.slice(start, end).forEach((child) => wrapper.append(child));
    });
  }

  /** Renders the terms body using the shared themed Markdown content container. */
  override render(): string {
    return this.markdownLifecycle.renderThemedContent("terms-markdown-content");
  }
}
