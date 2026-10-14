import {BaseElement, BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MD_RENDERED_EVENT, type MdRenderedDetail} from "@ayu-sh-kr/dota-md";
import {blogArticleContent} from "@app/data/blog-content.ts";
import {BLOG_MARKDOWN_SOURCE_EVENT} from "@app/events/blog.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/**
 * Renders blog Markdown with portfolio styling and article-specific enhancements.
 *
 * Hosts a dota-md `<md-view>` inside the shared article skeleton. Source published
 * through {@link BLOG_MARKDOWN_SOURCE_EVENT} is rendered into that view; when it
 * reports `md-rendered`, this host removes the duplicate H1, adds copy-code
 * buttons, and completes hash scrolling. The shared lifecycle utility owns
 * fallback, skeleton, and disconnect behavior.
 *
 * Selector: `blog-markdown-view`.
 */
@Component({
  selector: "blog-markdown-view",
  shadow: false,
})
export class BlogMarkdownViewComponent extends BaseElement {
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);

  constructor() {
    super();
  }

  /** Captures fallback content and bounds the loading skeleton unless the article was prerendered. */
  @BeforeInit()
  beforeViewInit(): void {
    const hasHydratedContent = this.hasAttribute("data-dh-c") && this.querySelector(".blog-markdown-content") !== null;
    this.markdownLifecycle.captureInitialContent();
    if (!hasHydratedContent) {
      this.markdownLifecycle.startSkeletonTimeout();
    }
  }

  /** Renders the raw Markdown source published for the active blog article. */
  @OnEvent(BLOG_MARKDOWN_SOURCE_EVENT)
  renderMarkdownSource(event: ApplicationEvent<typeof BLOG_MARKDOWN_SOURCE_EVENT>): void {
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  /**
   * Adds blog-specific behavior after `<md-view>` renders: removes the duplicate
   * H1, wraps code blocks with copy controls, and completes hash scrolling.
   */
  @BindEvent({event: MD_RENDERED_EVENT, id: "md-view"})
  decorateMarkdown(event: CustomEvent<MdRenderedDetail>): void {
    const {container} = event.detail;
    this.markdownLifecycle.revealSkeleton();
    container.querySelector("h1")?.remove();
    container.querySelectorAll("pre").forEach((pre) => {
      pre.tabIndex = 0;
      if (pre.parentElement?.classList.contains("blog-code-block")) {
        return;
      }

      const codeBlock = document.createElement("div");
      codeBlock.className = "blog-code-block";
      pre.replaceWith(codeBlock);
      codeBlock.append(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.copyCode = "true";
      button.textContent = blogArticleContent.markdown.copyLabel;
      button.className = "blog-copy-button";
      codeBlock.append(button);
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

  /** Renders the article skeleton around the themed `<md-view>`. */
  render() {
    return html`${trustedHTML(this.markdownLifecycle.renderArticleSkeleton("blog-markdown-content"))}`;
  }
}
