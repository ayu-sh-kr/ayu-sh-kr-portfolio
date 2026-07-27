import {BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {ApplicationEventService} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MdViewComponent} from "@ayu-sh-kr/dota-md";
import {
  TERMS_MARKDOWN_RENDER_EVENT,
  TERMS_MARKDOWN_SOURCE_EVENT,
  type TermsMarkdownRender,
  type TermsSection,
} from "@app/events/terms.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

@Component({
  selector: "terms-markdown-view",
  shadow: false,
})
export class TermsMarkdownViewComponent extends MdViewComponent {
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private sections: readonly TermsSection[] = [];

  constructor() {
    super();
  }

  @BeforeInit()
  captureInitialContent(): void {
    this.markdownLifecycle.captureInitialContent();
  }

  @OnEvent(TERMS_MARKDOWN_SOURCE_EVENT)
  onMarkdownSource(event: ApplicationEvent<typeof TERMS_MARKDOWN_SOURCE_EVENT>): void {
    this.sections = event.data.sections;
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  @OnEvent("md:render")
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
  async onAnchorClick(event: Event): Promise<void> {
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
  onDisconnected(): void {
    this.markdownLifecycle.disconnect();
  }

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

  override render(): string {
    return this.markdownLifecycle.renderThemedContent("terms-markdown-content");
  }
}
