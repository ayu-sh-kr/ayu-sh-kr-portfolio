import {BaseElement, BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {MD_RENDERED_EVENT, type MdRenderedDetail} from "@ayu-sh-kr/dota-md";
import {NEWS_MARKDOWN_SOURCE_EVENT} from "@app/events/news.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/**
 * Renders a short Dispatch document through the portfolio Markdown theme.
 *
 * Hosts a dota-md `<md-view>` inside the shared article skeleton. The source
 * arrives through {@link NEWS_MARKDOWN_SOURCE_EVENT}; once `<md-view>` reports
 * `md-rendered`, this host removes the duplicate H1, marks the article ready,
 * and completes hash scrolling.
 *
 * Selector: `news-markdown-view`.
 */
@Component({selector: "news-markdown-view", shadow: false})
export class NewsMarkdownViewComponent extends BaseElement {
  readonly markdownLifecycle = new MarkdownLifecycleUtils(this);

  constructor() {
    super();
  }

  /** Preserves SSG content and starts a bounded loading skeleton only when needed. */
  @BeforeInit()
  beforeViewInit(): void {
    const hasHydratedContent = this.hasAttribute("data-dh-c") && this.querySelector(".news-markdown-content") !== null;
    this.markdownLifecycle.captureInitialContent();
    if (!hasHydratedContent) {
      this.markdownLifecycle.startSkeletonTimeout();
    }
  }

  /** Accepts the active route's document without coupling Markdown rendering to fetch. */
  @OnEvent(NEWS_MARKDOWN_SOURCE_EVENT)
  renderMarkdownSource(event: ApplicationEvent<typeof NEWS_MARKDOWN_SOURCE_EVENT>): void {
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  /** Removes source-level title duplication and completes accessible Markdown setup. */
  @BindEvent({event: MD_RENDERED_EVENT, id: "md-view"})
  decorateMarkdown(event: CustomEvent<MdRenderedDetail>): void {
    const {container} = event.detail;
    this.markdownLifecycle.revealSkeleton();
    container.querySelector("h1")?.remove();
    this.closest("[data-news-document]")?.setAttribute("aria-busy", "false");
    this.markdownLifecycle.scheduleHashScroll();
  }

  /** Cancels pending Markdown work when navigation removes the note. */
  @OnEvent("disconnected", true)
  cleanupMarkdown(): void {
    this.markdownLifecycle.disconnect();
  }

  /** Renders the article skeleton around the themed `<md-view>`. */
  render() {
    return html`${trustedHTML(this.markdownLifecycle.renderArticleSkeleton("news-markdown-content"))}`;
  }
}
