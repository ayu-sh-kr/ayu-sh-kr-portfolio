import {ApplicationEventService, BeforeInit, BindEvent, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {html, TemplateResult, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MdViewComponent, type ColorName, type ThemeName} from "@ayu-sh-kr/dota-md";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {
  PRIVACY_MARKDOWN_RENDER_EVENT,
  PRIVACY_MARKDOWN_SOURCE_EVENT,
  type PrivacyMarkdownRender,
  type PrivacySection,
} from "@app/events/privacy.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/**
 * Renders the loaded privacy policy Markdown and publishes its section model.
 *
 * `privacy-view` supplies the source event after loading the legal document.
 * This adapter delegates common Markdown lifecycle work to
 * `MarkdownLifecycleUtils`, then adds privacy-specific heading wrappers,
 * section anchors, responsive tables, and reveal behavior for the TOC and
 * progress indicator.
 *
 * Selector: `privacy-markdown-view`.
 */
@Component({
  selector: "privacy-markdown-view",
  shadow: false,
})
export class PrivacyMarkdownViewComponent extends MdViewComponent {
  /** Portfolio theme binding declared on this concrete Dota component. */
  @Property({name: "theme", type: String})
  override theme: ThemeName = portfolioMarkdownTheme.name as ThemeName;

  /** Portfolio color binding declared on this concrete Dota component. */
  @Property({name: "color", type: String})
  override color: ColorName = portfolioMarkdownColor;

  /** Shared capture, rendering, hash-scroll, and feedback lifecycle for Markdown. */
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);
  /** Publisher used to notify `privacy-toc` after headings have been decorated. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  /** Section metadata matching the headings in the currently rendered document. */
  private sections: readonly PrivacySection[] = [];

  constructor() {
    super();
  }

  @BeforeInit()
  /** Captures the loading placeholder before Markdown replaces the initial content. */
  captureInitialContent(): void {
    this.markdownLifecycle.captureInitialContent();
    this.markdownLifecycle.startSkeletonTimeout();
  }

  @OnEvent(PRIVACY_MARKDOWN_SOURCE_EVENT)
  /** Receives the loaded policy source and begins the shared Markdown render flow. */
  renderMarkdownSource(event: ApplicationEvent<typeof PRIVACY_MARKDOWN_SOURCE_EVENT>): void {
    this.sections = event.data.sections;
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  @OnEvent("md:render")
  /**
   * Enhances rendered Markdown with legal-section structure and publishes the
   * final section model for the TOC.
   */
  override onContentChange(event: ApplicationEvent<"md:render">): void {
    super.onContentChange(event);
    this.markdownLifecycle.revealSkeleton();
    const content = this.querySelector<HTMLElement>(".privacy-markdown-content");
    if (!content) {
      return;
    }

    this.decorateSections(content);
    this.markdownLifecycle.decorateResponsiveTables(content);
    this.markdownLifecycle.setupReveals(".privacy-reveal");
    this.closest("[data-privacy-markdown]")?.setAttribute("aria-busy", "false");
    void this.publisher.publishAsync({
      name: PRIVACY_MARKDOWN_RENDER_EVENT,
      data: {sections: this.sections} satisfies PrivacyMarkdownRender,
    });

    this.markdownLifecycle.scheduleHashScroll();
  }

  @BindEvent({event: "click", id: "[data-privacy-anchor]"})
  /** Copies a section's canonical URL while preserving the selected hash. */
  async copyAnchorLink(event: Event): Promise<void> {
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
    this.markdownLifecycle.markCopied(anchor, "Copied", "#", "copied");
  }

  @OnEvent("disconnected", true)
  /** Releases timers and listeners owned by the Markdown lifecycle helper. */
  cleanupMarkdownLifecycle(): void {
    this.markdownLifecycle.disconnect();
  }

  /** Adds IDs, numbered labels, and copyable anchors to rendered policy headings. */
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
      number.textContent = (index + 1).toString().padStart(2, "0");
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

      const sectionHead = document.createElement("div");
      sectionHead.className = "privacy-section-head";
      const chip = document.createElement("span");
      chip.className = "privacy-audience-chip";
      chip.textContent = section.scope;
      sectionHead.append(chip);
      wrapper.append(sectionHead);

      const start = children.indexOf(heading);
      const end = headings[index + 1] ? children.indexOf(headings[index + 1]) : children.length;
      children.slice(start, end).forEach((child) => wrapper.append(child));
    });
  }

  /** Renders the policy body using the shared themed Markdown content container. */
  override render(): TemplateResult {
    return html`${trustedHTML(this.markdownLifecycle.renderArticleSkeleton("privacy-markdown-content"))}`;
  }
}
