import {ApplicationEventService, BaseElement, Component, HTML, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {getShowcaseProject, getShowcaseSlug, showcaseProjects, type ShowcaseProject} from "@app/data/showcase-content.ts";
import {SHOWCASE_MARKDOWN_SOURCE_EVENT, type ShowcaseMarkdownSource} from "@app/events/showcase.events.ts";
import {ShowcaseLoaderService} from "@app/service/showcase-loader.service.ts";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {MarkdownProgressLifecycle} from "@app/utils/markdown-lifecycle.utils.ts";

/** Formats the catalog status for the case-study metadata row. */
const formatStatus = (status: ShowcaseProject["status"]): string =>
  status.charAt(0).toUpperCase() + status.slice(1);

/**
 * Loads and presents one showcase case study selected by the current pathname.
 *
 * The view resolves the project slug once, loads Markdown through
 * `ShowcaseLoaderService`, and publishes {@link SHOWCASE_MARKDOWN_SOURCE_EVENT}
 * for the connected Markdown child. It also owns article progress and aborts
 * pending work on disconnect so stale responses cannot replace newer state.
 *
 * Selector: `showcase-view`.
 */
@Component({
  selector: "showcase-view",
  shadow: false,
})
export class ShowcaseViewComponent extends BaseElement {
  /** Publisher used to hand loaded Markdown to the child Markdown view. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  /** Static-content loader that strips frontmatter before publishing Markdown. */
  private readonly loader = new ShowcaseLoaderService();
  /** Shared lifecycle helper for the article reading-progress indicator. */
  private readonly progressLifecycle = new MarkdownProgressLifecycle(this);
  /** Project resolved from the current `/showcase/:slug` pathname. */
  private readonly project = getShowcaseProject(getShowcaseSlug(window.location.pathname)) ?? null;
  /** Abort controller for the currently active Markdown request. */
  private articleRequest: AbortController | null = null;
  /** Whether the article child should expose its loading state. */
  private loading = true;
  /** User-facing load failure message; empty while loading or after success. */
  private loadError = "";

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  /** Starts progress tracking and loads the resolved case study after connect. */
  initializeShowcaseView(): void {
    this.scheduleProgressRender();
    if (this.project) {
      void this.loadShowcaseArticle(this.project);
    }
  }

  @OnEvent("disconnected", true)
  /** Aborts the request and releases progress listeners owned by this view. */
  cleanupShowcaseView(): void {
    this.articleRequest?.abort();
    this.articleRequest = null;
    this.progressLifecycle.disconnect();
  }

  @WindowListener({event: "scroll"})
  /** Schedules document progress updates without doing layout work per scroll event. */
  scheduleProgressRender(): void {
    this.progressLifecycle.scheduleDocumentProgress("[data-showcase-progress]");
  }

  /**
   * Loads one project's Markdown and publishes it to the connected child view.
   *
   * A new request aborts the previous one, and both the abort signal and request
   * identity are checked before success or failure updates the component.
   */
  private async loadShowcaseArticle(project: ShowcaseProject): Promise<void> {
    this.articleRequest?.abort();
    const request = new AbortController();
    this.articleRequest = request;

    try {
      const markdown = await this.loader.load(project, request.signal);
      if (request.signal.aborted || this.articleRequest !== request) {
        return;
      }

      this.loading = false;
      this.loadError = "";
      // Keep the connected Markdown viewer alive so it can receive the source event.
      void this.publisher.publishAsync({
        name: SHOWCASE_MARKDOWN_SOURCE_EVENT,
        data: {markdown} satisfies ShowcaseMarkdownSource,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (this.articleRequest !== request) {
        return;
      }

      this.loading = false;
      this.loadError = "This showcase could not be loaded right now.";
      this.updateHTML();
    }
  }

  /** Returns the next catalog entry for the article footer, if one exists. */
  private getNextProject(): ShowcaseProject | null {
    if (!this.project) {
      return null;
    }

    const currentIndex = showcaseProjects.indexOf(this.project);
    return showcaseProjects[currentIndex + 1] ?? null;
  }

  /** Renders the not-found state, loading/error article, and next-project footer. */
  render(): string {
    if (!this.project) {
      return HTML`
        <main class="showcase-article-shell layout-page layout-section-hero">
          <a class="showcase-back-link" href="/showcase">← All showcases</a>
          <div class="showcase-not-found">
            <p class="showcase-eyebrow">404</p>
            <h1>That showcase is not here.</h1>
            <a class="app-link app-link--button app-link--ink" href="/showcase">Browse the showcase</a>
          </div>
        </main>
      `;
    }

    const next = this.getNextProject();
    const markdown = this.loadError
      ? `<article class="showcase-prose"><p class="showcase-load-error" role="alert">${escapeHtml(this.loadError)} <a href="/showcase">Return to all showcases</a>.</p></article>`
      : `<article class="showcase-prose" data-showcase-markdown aria-busy="${this.loading}">
          <showcase-markdown-view theme="${portfolioMarkdownTheme.name}" color="${portfolioMarkdownColor}">
            <p class="showcase-loading">Loading the case study…</p>
          </showcase-markdown-view>
        </article>`;

    return HTML`
      <div class="showcase-progress" data-showcase-progress aria-hidden="true"></div>
      <main class="showcase-article-shell layout-page layout-section-hero">
        <a class="showcase-back-link" href="/showcase">← All showcases</a>
        <showcase-article-header
          kind="${escapeHtml(this.project.kind)}"
          year="${this.project.year}"
          status="${escapeHtml(formatStatus(this.project.status))}"
          title="${escapeHtml(this.project.title)}"
          tagline="${escapeHtml(this.project.tagline)}"
          stack="${escapeHtml(this.project.stack.join("|"))}">
        </showcase-article-header>
        <div class="showcase-reader-layout">
          <showcase-toc></showcase-toc>
          ${markdown}
        </div>
        <footer class="showcase-article-footer">
          <a class="showcase-quiet-card" href="/showcase"><span>←</span><span><small>Back to</small>All showcases</span></a>
          ${next ? `<a class="showcase-quiet-card showcase-quiet-card-next" href="/showcase/${next.slug}"><span><small>Next case study</small>${escapeHtml(next.title)}</span><span>→</span></a>` : ""}
        </footer>
      </main>
    `;
  }
}
