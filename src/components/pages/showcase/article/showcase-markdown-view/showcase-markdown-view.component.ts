import {BaseElement, BeforeInit, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, TemplateResult, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {MD_RENDERED_EVENT, MDService, type MdRenderedDetail} from "@ayu-sh-kr/dota-md";
import {SHOWCASE_MARKDOWN_SOURCE_EVENT} from "@app/events/showcase.events.ts";
import {MarkdownLifecycleUtils} from "@app/utils/markdown-lifecycle.utils.ts";

/**
 * Hosts the Markdown body of a showcase case study.
 *
 * The parent `showcase-view` publishes {@link SHOWCASE_MARKDOWN_SOURCE_EVENT}
 * after loading a project. This host renders the source into its dota-md
 * `<md-view>`, keeps the article loading state synchronized, and shares the
 * result with `showcase-toc` as
 * `md:render` when the view reports `md-rendered`.
 *
 * Selector: `showcase-markdown-view`.
 */
@Component({
  selector: "showcase-markdown-view",
  shadow: false,
})
export class ShowcaseMarkdownViewComponent extends BaseElement {
  /** Shared capture, rendering, hash-scroll, and feedback lifecycle for Markdown. */
  private readonly markdownLifecycle = new MarkdownLifecycleUtils(this);

  constructor() {
    super();
  }

  /** Captures the loading placeholder and bounds the skeleton unless the case study was prerendered. */
  @BeforeInit()
  beforeViewInit(): void {
    const hasHydratedContent = this.hasAttribute("data-dh-c") && this.querySelector(".showcase-markdown-content") !== null;
    this.markdownLifecycle.captureInitialContent();
    if (!hasHydratedContent) {
      this.markdownLifecycle.startSkeletonTimeout();
    }
  }

  /** Renders the article source published by the showcase article loader. */
  @OnEvent(SHOWCASE_MARKDOWN_SOURCE_EVENT)
  renderMarkdownSource(event: ApplicationEvent<typeof SHOWCASE_MARKDOWN_SOURCE_EVENT>): void {
    this.markdownLifecycle.renderSource(event.data.markdown);
  }

  /**
   * Adds showcase-specific behavior after `<md-view>` renders.
   *
   * The article is marked ready, the TOC receives the result once its headings
   * exist, and any pending hash navigation is scheduled afterward.
   */
  @BindEvent({event: MD_RENDERED_EVENT, id: "md-view"})
  decorateMarkdown(event: CustomEvent<MdRenderedDetail>): void {
    const {container} = event.detail;
    this.markdownLifecycle.revealSkeleton();
    container.querySelector("h1")?.remove();
    this.closest("[data-showcase-markdown]")?.setAttribute("aria-busy", "false");
    MDService.publish(event.detail.result);
    this.markdownLifecycle.scheduleHashScroll();
  }

  /** Releases timers and listeners owned by the shared Markdown lifecycle. */
  @OnEvent("disconnected", true)
  cleanupMarkdownLifecycle(): void {
    this.markdownLifecycle.disconnect();
  }

  /** Renders the article skeleton around the themed `<md-view>`. */
  render(): TemplateResult {
    return html`${trustedHTML(this.markdownLifecycle.renderArticleSkeleton("showcase-markdown-content"))}`;
  }
}
