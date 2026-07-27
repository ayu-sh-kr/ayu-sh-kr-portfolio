import {BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MdViewComponent} from "@ayu-sh-kr/dota-md";
import {SHOWCASE_MARKDOWN_SOURCE_EVENT} from "@app/events/showcase.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/**
 * Adapts the shared Markdown view for showcase case studies.
 *
 * The parent `showcase-view` publishes {@link SHOWCASE_MARKDOWN_SOURCE_EVENT}
 * after loading a project. This component hands the source to the shared
 * Markdown lifecycle utility, enhances rendered code blocks and images, and
 * keeps the article's loading state synchronized with Markdown rendering.
 *
 * Selector: `showcase-markdown-view`.
 */
@Component({
  selector: "showcase-markdown-view",
  shadow: false,
})
export class ShowcaseMarkdownViewComponent extends MdViewComponent {
  /** Shared capture, rendering, hash-scroll, and feedback lifecycle for Markdown. */
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);

  constructor() {
    super();
  }

  @BeforeInit()
  /** Captures the loading placeholder before Markdown replaces the initial content. */
  captureInitialContent(): void {
    this.markdownLifecycle.captureInitialContent();
  }

  @OnEvent(SHOWCASE_MARKDOWN_SOURCE_EVENT)
  /** Renders the article source published by the showcase article loader. */
  renderMarkdownSource(event: ApplicationEvent<typeof SHOWCASE_MARKDOWN_SOURCE_EVENT>): void {
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  @OnEvent("md:render")
  /**
   * Adds showcase-specific behavior after the shared Markdown renderer updates.
   *
   * Code blocks receive a copy button, images are lazy-loaded, the article is
   * marked ready, and any pending hash navigation is scheduled afterward.
   */
  override onContentChange(event: ApplicationEvent<"md:render">): void {
    super.onContentChange(event);
    this.querySelector("h1")?.remove();
    this.querySelectorAll("pre").forEach((pre) => {
      pre.tabIndex = 0;
      if (pre.querySelector("[data-copy-code]")) {
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.copyCode = "true";
      button.textContent = "Copy";
      button.className = "showcase-copy-button";
      pre.append(button);
    });
    this.querySelectorAll("img").forEach((image) => {
      image.loading = "lazy";
      image.decoding = "async";
    });
    this.closest("[data-showcase-markdown]")?.setAttribute("aria-busy", "false");

    this.markdownLifecycle.scheduleHashScroll();
  }

  @BindEvent({event: "click", id: "[data-copy-code]"})
  /** Copies the selected code block and gives the button temporary feedback. */
  copyCode(event: Event): void {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-copy-code]");
    if (!button) {
      return;
    }

    const code = button.parentElement?.querySelector("code")?.textContent ?? "";
    const clipboardWrite = navigator.clipboard?.writeText(code);
    if (clipboardWrite) {
      void clipboardWrite;
    }
    this.markdownLifecycle.markCopied(button, "Copied", "Copy");
  }

  @OnEvent("disconnected", true)
  /** Releases timers and listeners owned by the shared Markdown lifecycle. */
  cleanupMarkdownLifecycle(): void {
    this.markdownLifecycle.disconnect();
  }

  /** Renders Markdown content with the showcase article theme and content class. */
  override render(): string {
    return this.markdownLifecycle.renderThemedContent("showcase-markdown-content");
  }
}
