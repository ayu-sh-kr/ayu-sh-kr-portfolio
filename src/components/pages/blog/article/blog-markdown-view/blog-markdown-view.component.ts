import {copyArticleCode, decorateArticleCode} from "@app/components/utils/article-code/article-code.utils.ts";
import {BaseElement, BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MD_RENDERED_EVENT, type MdRenderedDetail} from "@ayu-sh-kr/dota-md";
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
    decorateArticleCode(container);
    this.closest("[data-blog-markdown]")?.setAttribute("aria-busy", "false");
    this.markdownLifecycle.scheduleHashScroll();
  }

  /** Copies source text with local feedback, preserving the loaded article DOM. */
  @BindEvent({event: "click", id: "[data-article-code-copy]"})
  async copyCode(event: Event): Promise<void> {
    await copyArticleCode(event);
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
