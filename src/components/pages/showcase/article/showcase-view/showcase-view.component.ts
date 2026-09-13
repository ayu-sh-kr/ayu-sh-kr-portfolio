import {ApplicationEventService, BaseElement, Component, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {getShowcaseProject, getShowcaseSlug, showcaseProjects, type ShowcaseProject} from "@app/data/showcase-content.ts";
import {SHOWCASE_MARKDOWN_SOURCE_EVENT, type ShowcaseMarkdownSource} from "@app/events/showcase.events.ts";
import {ShowcaseLoaderService} from "@app/service/showcase-loader.service.ts";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {MarkdownProgressLifecycle} from "@app/utils/markdown-lifecycle.utils.ts";
import {blogViewCountService, toBlogViewTrackingFailureReason} from "@app/service/blog-view-count.service.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

/** Formats the catalog status for the case-study metadata row. */
const formatStatus = (status: ShowcaseProject["status"]): string =>
  status.charAt(0).toUpperCase() + status.slice(1);

/**
 * Loads and presents one showcase case study selected by the current pathname.
 *
 * The view resolves the project slug once, loads Markdown through
 * `ShowcaseLoaderService`, and publishes {@link SHOWCASE_MARKDOWN_SOURCE_EVENT}
 * for the connected Markdown child. After connection, a valid case study also
 * records a non-blocking typed view; its outcome never delays the reader.
 * The element owns article progress and aborts pending work on disconnect so
 * stale responses cannot replace newer state.
 *
 * Selector: `showcase-view`.
 */
@Component({
  selector: "showcase-view",
  shadow: false,
})
export class ShowcaseViewComponent extends BaseElement {
  /** Delivers loaded Markdown to the connected `showcase-markdown-view` child. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  /** Fetches a project's authored Markdown and strips its frontmatter before publication. */
  private readonly loader = new ShowcaseLoaderService();
  /** Owns the throttled document-progress work while this article is connected. */
  private readonly progressLifecycle = new MarkdownProgressLifecycle(this);
  /** Catalog record selected once from the current `/showcase/:slug` route, or `null` for a 404. */
  private readonly project = getShowcaseProject(getShowcaseSlug(window.location.pathname)) ?? null;
  /** Cancels the in-flight Markdown request when this view is replaced or disconnected. */
  private articleRequest: AbortController | null = null;
  /** Keeps the Markdown region marked busy until the load succeeds or reports an error. */
  private loading = true;
  /** Reader-safe load failure shown in place of the Markdown body; empty for normal states. */
  private loadError = "";

  @OnEvent("connected", true)
  /**
   * Starts the detail-page work after the custom element connects.
   *
   * Unknown routes retain the 404 render and do not request content or tracking.
   * Valid projects schedule reading progress, submit their typed aggregate metric in
   * the background, and begin the abortable Markdown load for the child renderer.
   */
  initializeShowcaseView(): void {
    this.scheduleProgressRender();
    const project = this.project;
    if (!project) {
      return;
    }

    void blogViewCountService.recordView(project.slug, "SHOWCASE").catch((error: unknown) => {
      publishAnalyticsEvent({
        eventName: "blog_view_tracking_failed",
        params: {reason: toBlogViewTrackingFailureReason(error)},
      });
    });
    void this.loadShowcaseArticle(project);
  }

  @OnEvent("disconnected", true)
  /**
   * Releases work owned by this connected instance before the route changes.
   *
   * Aborting prevents a late Markdown response from publishing into a detached
   * reader, while the lifecycle helper clears its queued progress work.
   */
  cleanupShowcaseView(): void {
    this.articleRequest?.abort();
    this.articleRequest = null;
    this.progressLifecycle.disconnect();
  }

  @WindowListener({event: "scroll"})
  /** Queues, rather than performs, the scroll-driven reading-progress measurement. */
  scheduleProgressRender(): void {
    this.progressLifecycle.scheduleDocumentProgress("[data-showcase-progress]");
  }

  /**
   * Fetches one case study's Markdown and hands it to the connected child view.
   *
   * This is the only Markdown request boundary in the component. A replacement
   * request aborts its predecessor; both the signal and identity checks prevent
   * a late response from changing current state. Successful content is published
   * through {@link SHOWCASE_MARKDOWN_SOURCE_EVENT}; a current non-abort failure
   * instead replaces the loading state with reader-safe feedback.
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

  /**
   * Derives the complete article surface from route state and Markdown load state.
   *
   * Rendering does not fetch or publish anything: lifecycle handlers own those
   * effects. A missing catalog record produces the standalone 404 surface; a
   * resolved record keeps the Markdown child connected for its published source.
   */
  render() {
    const project = this.project;
    if (!project) {
      return html`
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

    const nextProject = showcaseProjects[showcaseProjects.indexOf(project) + 1];
    const markdown = this.loadError
      ? `<article class="showcase-prose"><p class="showcase-load-error" role="alert">${escapeHtml(this.loadError)} <a href="/showcase">Return to all showcases</a>.</p></article>`
      : `<article class="showcase-prose" data-showcase-markdown aria-busy="${this.loading}">
          <showcase-markdown-view theme="${portfolioMarkdownTheme.name}" color="${portfolioMarkdownColor}">
            <p class="showcase-loading">Loading the case study…</p>
          </showcase-markdown-view>
        </article>`;

    return html`
      <div class="showcase-progress" data-showcase-progress aria-hidden="true"></div>
      <main class="showcase-article-shell layout-page layout-section-hero">
        <a class="showcase-back-link" href="/showcase">← All showcases</a>
        <showcase-article-header
          kind="${project.kind}"
          year="${project.year}"
          status="${formatStatus(project.status)}"
          title="${project.title}"
          tagline="${project.tagline}"
          stack="${project.stack.join("|")}">
        </showcase-article-header>
        <div class="showcase-reader-layout">
          <showcase-toc></showcase-toc>
          ${trustedHTML(markdown)}
        </div>
        <footer class="showcase-article-footer">
          <a class="showcase-quiet-card" href="/showcase"><span>←</span><span><small>Back to</small>All showcases</span></a>
          ${trustedHTML(nextProject ? `<a class="showcase-quiet-card showcase-quiet-card-next" href="/showcase/${nextProject.slug}"><span><small>Next case study</small>${escapeHtml(nextProject.title)}</span><span>→</span></a>` : "")}
        </footer>
      </main>
    `;
  }
}
