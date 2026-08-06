import {BeforeInit, BindEvent, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {html} from "@ayu-sh-kr/dota-rendering";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MdViewComponent, type ColorName, type ThemeName} from "@ayu-sh-kr/dota-md";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {blogArticleContent} from "@app/data/blog-content.ts";
import {BLOG_MARKDOWN_SOURCE_EVENT} from "@app/events/blog.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/**
 * Renders blog Markdown with portfolio styling and article-specific enhancements.
 *
 * It captures any authored fallback content before initialization, renders source
 * published through {@link BLOG_MARKDOWN_SOURCE_EVENT}, and post-processes Markdown output with lazy images,
 * copy-code buttons, and hash scrolling. The shared lifecycle utility owns theme,
 * source, progress, and disconnect behavior; this component adds blog-only details.
 *
 * Selector: `blog-markdown-view`.
 */
@Component({
  selector: "blog-markdown-view",
  shadow: false,
})
export class BlogMarkdownViewComponent extends MdViewComponent {
  /** Markdown theme attribute consumed by the portfolio lifecycle; defaults to the registered portfolio theme. */
  @Property({name: "theme", type: String})
  override theme: ThemeName = portfolioMarkdownTheme.name as ThemeName;

  /** Markdown accent attribute consumed by the portfolio lifecycle; defaults to the portfolio primary color. */
  @Property({name: "color", type: String})
  override color: ColorName = portfolioMarkdownColor;

  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);

  constructor() {
    super();
  }

  /** Captures fallback Markdown before the renderer replaces the initial content. */
  @BeforeInit()
  captureInitialContent(): void {
    this.markdownLifecycle.captureInitialContent();
    this.markdownLifecycle.startSkeletonTimeout();
  }

  /** Renders the raw Markdown source published for the active blog article. */
  @OnEvent(BLOG_MARKDOWN_SOURCE_EVENT)
  renderMarkdownSource(event: ApplicationEvent<typeof BLOG_MARKDOWN_SOURCE_EVENT>): void {
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  /**
   * Adds blog-specific behavior after Dota Markdown renders: removes the duplicate
   * H1, enables code-copy controls, prepares images, and completes hash scrolling.
   */
  @OnEvent("md:render")
  override onContentChange(event: ApplicationEvent<"md:render">): void {
    super.onContentChange(event);
    this.markdownLifecycle.revealSkeleton();
    this.querySelector("h1")?.remove();
    this.querySelectorAll("pre").forEach((pre) => {
      pre.tabIndex = 0;
      if (pre.querySelector("[data-copy-code]")) {
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.copyCode = "true";
      button.textContent = blogArticleContent.markdown.copyLabel;
      button.className = "blog-copy-button";
      pre.append(button);
    });
    this.querySelectorAll("img").forEach((image) => {
      image.loading = "lazy";
      image.decoding = "async";
    });
    this.closest("[data-blog-markdown]")?.setAttribute("aria-busy", "false");

    this.markdownLifecycle.scheduleHashScroll();
  }

  /** Copies the nearest code block and delegates temporary button feedback to the lifecycle utility. */
  @BindEvent({event: "click", id: "[data-copy-code]"})
  copyCode(event: Event): void {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-copy-code]");
    if (!button) {
      return;
    }
    const code = button.parentElement?.querySelector("code")?.textContent ?? "";
    void navigator.clipboard?.writeText(code);
    this.markdownLifecycle.markCopied(button, blogArticleContent.markdown.copiedLabel, blogArticleContent.markdown.copyLabel);
  }

  /** Cancels lifecycle timers and pending frames when the Markdown view disconnects. */
  @OnEvent("disconnected", true)
  cleanupMarkdownLifecycle(): void {
    this.markdownLifecycle.disconnect();
  }

  /** Returns the themed Markdown container produced by the shared lifecycle utility. */
  override render() {
    return html`${this.markdownLifecycle.renderArticleSkeleton("blog-markdown-content")}`;
  }
}
