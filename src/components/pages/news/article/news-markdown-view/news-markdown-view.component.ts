import {BeforeInit, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {type ColorName, MdViewComponent, type ThemeName} from "@ayu-sh-kr/dota-md";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {NEWS_MARKDOWN_SOURCE_EVENT} from "@app/events/news.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/**
 * Renders a short Dispatch document through the portfolio Markdown theme.
 * The component shares the established Markdown lifecycle while applying only
 * note-specific semantics: no duplicate H1 and keyboard-reachable code blocks.
 *
 * Selector: `news-markdown-view`.
 */
@Component({selector: "news-markdown-view", shadow: false})
export class NewsMarkdownViewComponent extends MdViewComponent {
  /** Theme stays configurable for hydration while defaulting to the portfolio contract. */
  @Property({name: "theme", type: String})
  override theme: ThemeName = portfolioMarkdownTheme.name as ThemeName;

  /** Accent role follows the same registered color mapping as blog documents. */
  @Property({name: "color", type: String})
  override color: ColorName = portfolioMarkdownColor;

  readonly markdownLifecycle = new MarkdownLifecycleUtils(this);
  hasHydratedContent = false;

  /** Preserves SSG content and starts a bounded loading skeleton only when needed. */
  @BeforeInit()
  beforeViewInit(): void {
    this.hasHydratedContent = this.hasAttribute("data-dh-c")
      && this.querySelector(".news-markdown-content") !== null;
    this.markdownLifecycle.captureInitialContent();
    if (!this.hasHydratedContent) {
      this.markdownLifecycle.startSkeletonTimeout();
    }
  }

  /** Accepts the active route's document without coupling Markdown rendering to fetch. */
  @OnEvent(NEWS_MARKDOWN_SOURCE_EVENT)
  renderMarkdownSource(event: ApplicationEvent<typeof NEWS_MARKDOWN_SOURCE_EVENT>): void {
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  /** Removes source-level title duplication and completes accessible Markdown setup. */
  @OnEvent("md:render")
  override onContentChange(event: ApplicationEvent<"md:render">): void {
    super.onContentChange(event);
    this.markdownLifecycle.revealSkeleton();
    this.querySelector("h1")?.remove();
    this.querySelectorAll("pre").forEach((pre) => {
      pre.tabIndex = 0;
    });
    this.querySelectorAll("img").forEach((image) => {
      image.loading = "lazy";
      image.decoding = "async";
    });
    this.closest("[data-news-document]")?.setAttribute("aria-busy", "false");
    this.markdownLifecycle.scheduleHashScroll();
  }

  /** Cancels pending Markdown work when navigation removes the note. */
  @OnEvent("disconnected", true)
  cleanupMarkdown(): void {
    this.markdownLifecycle.disconnect();
  }

  override render() {
    const skeleton = this.markdownLifecycle.renderArticleSkeleton("news-markdown-content");
    return html`${trustedHTML(skeleton)}`;
  }
}
