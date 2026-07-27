import {BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {ApplicationEventService} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MdViewComponent} from "@ayu-sh-kr/dota-md";
import {
  PRIVACY_MARKDOWN_RENDER_EVENT,
  PRIVACY_MARKDOWN_SOURCE_EVENT,
  type PrivacyMarkdownRender,
  type PrivacySection,
} from "@app/events/privacy.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

@Component({
  selector: "privacy-markdown-view",
  shadow: false,
})
export class PrivacyMarkdownViewComponent extends MdViewComponent {
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private sections: readonly PrivacySection[] = [];

  constructor() {
    super();
  }

  @BeforeInit()
  captureInitialContent(): void {
    this.markdownLifecycle.captureInitialContent();
  }

  @OnEvent(PRIVACY_MARKDOWN_SOURCE_EVENT)
  onMarkdownSource(event: ApplicationEvent<typeof PRIVACY_MARKDOWN_SOURCE_EVENT>): void {
    this.sections = event.data.sections;
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  @OnEvent("md:render")
  override onContentChange(event: ApplicationEvent<"md:render">): void {
    super.onContentChange(event);
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

  override render(): string {
    return this.markdownLifecycle.renderThemedContent("privacy-markdown-content");
  }
}
