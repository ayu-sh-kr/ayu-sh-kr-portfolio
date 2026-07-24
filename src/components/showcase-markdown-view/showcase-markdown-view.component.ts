import {BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
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
import {SHOWCASE_MARKDOWN_SOURCE_EVENT} from "@app/events/showcase.events.ts";

@Component({
  selector: "showcase-markdown-view",
  shadow: false,
})
export class ShowcaseMarkdownViewComponent extends MdViewComponent {
  private readonly copyResetTimers = new Map<HTMLButtonElement, number>();
  private hashFrameId: number | null = null;

  constructor() {
    super();
  }

  @BeforeInit()
  captureInitialContent(): void {
    if (!this.content) {
      this.content = this.innerHTML;
    }
  }

  @OnEvent(SHOWCASE_MARKDOWN_SOURCE_EVENT)
  onMarkdownSource(event: ApplicationEvent<typeof SHOWCASE_MARKDOWN_SOURCE_EVENT>): void {
    MDService.render(event.data.markdown, {publish: true});
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

    if (window.location.hash) {
      let headingId = window.location.hash.slice(1);
      try {
        headingId = decodeURIComponent(headingId);
      } catch {
        headingId = "";
      }
      if (headingId) {
        this.hashFrameId = requestAnimationFrame(() => {
          this.hashFrameId = null;
          document.getElementById(headingId)?.scrollIntoView();
        });
      }
    }
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
    button.textContent = "Copied";

    const previousTimer = this.copyResetTimers.get(button);
    if (previousTimer !== undefined) {
      window.clearTimeout(previousTimer);
    }
    const timer = window.setTimeout(() => {
      this.copyResetTimers.delete(button);
      button.textContent = "Copy";
    }, 1400);
    this.copyResetTimers.set(button, timer);
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.copyResetTimers.forEach((timer) => window.clearTimeout(timer));
    this.copyResetTimers.clear();
    if (this.hashFrameId !== null) {
      cancelAnimationFrame(this.hashFrameId);
      this.hashFrameId = null;
    }
  }

  override render(): string {
    const themeName = this.getAttribute("theme") ?? portfolioMarkdownTheme.name;
    const colorName = (this.getAttribute("color") ?? portfolioMarkdownColor) as ColorName;
    const theme = THEMES[themeName] ?? portfolioMarkdownTheme;
    const themedContent = this.content ? applyMarkdownTheme(this.content, theme, colorName) : "";

    return `
      <div class="showcase-markdown-content ${getSelectionClass(theme, colorName)}"
           style="font-family: ${theme.fontFamily},serif">
        ${themedContent}
      </div>
    `;
  }
}
