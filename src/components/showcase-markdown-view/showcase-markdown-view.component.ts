import {BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MdViewComponent} from "@ayu-sh-kr/dota-md";
import {SHOWCASE_MARKDOWN_SOURCE_EVENT} from "@app/events/showcase.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

@Component({
  selector: "showcase-markdown-view",
  shadow: false,
})
export class ShowcaseMarkdownViewComponent extends MdViewComponent {
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);

  constructor() {
    super();
  }

  @BeforeInit()
  captureInitialContent(): void {
    this.markdownLifecycle.captureInitialContent();
  }

  @OnEvent(SHOWCASE_MARKDOWN_SOURCE_EVENT)
  onMarkdownSource(event: ApplicationEvent<typeof SHOWCASE_MARKDOWN_SOURCE_EVENT>): void {
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  @OnEvent("md:render")
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
  handleCopy(event: Event): void {
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
  onDisconnected(): void {
    this.markdownLifecycle.disconnect();
  }

  override render(): string {
    return this.markdownLifecycle.renderThemedContent("showcase-markdown-content");
  }
}
