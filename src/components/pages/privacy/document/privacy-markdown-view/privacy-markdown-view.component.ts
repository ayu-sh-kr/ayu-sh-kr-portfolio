import {ApplicationEventService, BaseElement, BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, TemplateResult, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MD_RENDERED_EVENT, type MdRenderedDetail} from "@ayu-sh-kr/dota-md";
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
export class PrivacyMarkdownViewComponent extends BaseElement {
  /** Shared capture, rendering, hash-scroll, and feedback lifecycle for Markdown. */
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);
  /** Publisher used to notify `privacy-toc` after headings have been decorated. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  /** Section metadata matching the headings in the currently rendered document. */
  private sections: readonly PrivacySection[] = [];
  /** True when SSG already rendered and decorated this document's Markdown. */
  private hasHydratedContent = false;

  constructor() {
    super();
  }

  /** Captures the loading placeholder and bounds the skeleton unless the document was prerendered. */
  @BeforeInit()
  beforeViewInit(): void {
    this.hasHydratedContent = this.hasAttribute("data-dh-c") && this.querySelector(".privacy-markdown-content") !== null;
    this.markdownLifecycle.captureInitialContent();
    if (!this.hasHydratedContent) {
      this.markdownLifecycle.startSkeletonTimeout();
    }
  }

  /**
   * Reattaches client-only behavior to prerendered Markdown.
   *
   * SSG output already has section wrappers, anchors, and table labels, but no
   * reveal observer, so its `.privacy-reveal` sections would stay hidden. Hash
   * navigation also needs one pass now that no `md-rendered` event will arrive.
   */
  @OnEvent("connected", true)
  resumePrerenderedContent(): void {
    if (!this.hasHydratedContent) {
      return;
    }
    this.markdownLifecycle.setupReveals(".privacy-reveal");
    this.markdownLifecycle.scheduleHashScroll();
  }

  /** Receives the loaded policy source and begins the shared Markdown render flow. */
  @OnEvent(PRIVACY_MARKDOWN_SOURCE_EVENT)
  renderMarkdownSource(event: ApplicationEvent<typeof PRIVACY_MARKDOWN_SOURCE_EVENT>): void {
    this.sections = event.data.sections;
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  /**
   * Adds legal-section structure to the Markdown rendered by `<md-view>`, then
   * publishes the final section model for the TOC.
   */
  @BindEvent({event: MD_RENDERED_EVENT, id: "md-view"})
  decorateMarkdown(event: CustomEvent<MdRenderedDetail>): void {
    const content = event.detail.container;
    this.markdownLifecycle.revealSkeleton();
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

  /** Copies a section's canonical URL while preserving the selected hash. */
  @BindEvent({event: "click", id: "[data-privacy-anchor]"})
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

  /** Releases timers and listeners owned by the Markdown lifecycle helper. */
  @OnEvent("disconnected", true)
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
  render(): TemplateResult {
    return html`${trustedHTML(this.markdownLifecycle.renderArticleSkeleton("privacy-markdown-content"))}`;
  }
}
