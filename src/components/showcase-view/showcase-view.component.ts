import {ApplicationEventService, BaseElement, Component, HTML} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {getShowcaseProject, getShowcaseSlug, showcaseProjects, type ShowcaseProject} from "@app/data/showcase-content.ts";
import {SHOWCASE_MARKDOWN_SOURCE_EVENT, type ShowcaseMarkdownSource} from "@app/events/showcase.events.ts";
import {ShowcaseLoaderService} from "@app/service/showcase-loader.service.ts";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";

const displayStatus = (status: ShowcaseProject["status"]): string =>
  status.charAt(0).toUpperCase() + status.slice(1);

@Component({
  selector: "showcase-view",
  shadow: false,
})
export class ShowcaseViewComponent extends BaseElement {
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private readonly loader = new ShowcaseLoaderService();
  private readonly project = getShowcaseProject(getShowcaseSlug(window.location.pathname)) ?? null;
  private articleRequest: AbortController | null = null;
  private loading = true;
  private loadError = "";
  private frameId: number | null = null;

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    window.addEventListener("scroll", this.scheduleProgressRender, {passive: true});
    this.scheduleProgressRender();
    if (this.project) {
      void this.loadArticle(this.project);
    }
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    window.removeEventListener("scroll", this.scheduleProgressRender);
    this.articleRequest?.abort();
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private readonly scheduleProgressRender = (): void => {
    if (this.frameId !== null) {
      return;
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      const progressBar = this.querySelector<HTMLElement>("[data-showcase-progress]");
      if (!progressBar) {
        return;
      }

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / scrollable));
      progressBar.style.transform = `scaleX(${progress})`;
    });
  };

  private async loadArticle(project: ShowcaseProject): Promise<void> {
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

  private nextProject(): ShowcaseProject | null {
    if (!this.project) {
      return null;
    }

    const currentIndex = showcaseProjects.indexOf(this.project);
    return showcaseProjects[currentIndex + 1] ?? null;
  }

  render(): string {
    if (!this.project) {
      return HTML`
        <main class="showcase-article-shell showcase-container">
          <a class="showcase-back-link" href="/showcase">← All showcases</a>
          <div class="showcase-not-found">
            <p class="showcase-eyebrow">404</p>
            <h1>That showcase is not here.</h1>
            <a class="showcase-button showcase-button-ink" href="/showcase">Browse the showcase</a>
          </div>
        </main>
      `;
    }

    const next = this.nextProject();
    const markdown = this.loadError
      ? `<article class="showcase-prose"><p class="showcase-load-error" role="alert">${escapeHtml(this.loadError)} <a href="/showcase">Return to all showcases</a>.</p></article>`
      : `<article class="showcase-prose" data-showcase-markdown aria-busy="${this.loading}">
          <showcase-markdown-view theme="${portfolioMarkdownTheme.name}" color="${portfolioMarkdownColor}">
            <p class="showcase-loading">Loading the case study…</p>
          </showcase-markdown-view>
        </article>`;

    return HTML`
      <div class="showcase-progress" data-showcase-progress aria-hidden="true"></div>
      <main class="showcase-article-shell showcase-container">
        <a class="showcase-back-link" href="/showcase">← All showcases</a>
        <header class="showcase-article-header">
          <div class="showcase-article-meta">
            <span class="showcase-chip">${escapeHtml(this.project.kind)}</span>
            <span class="showcase-chip showcase-chip-muted">${this.project.year}</span>
            <span class="showcase-chip showcase-chip-muted">${displayStatus(this.project.status)}</span>
          </div>
          <h1>${escapeHtml(this.project.title)}</h1>
          <p class="showcase-article-tagline">${escapeHtml(this.project.tagline)}</p>
          <div class="showcase-chip-row" aria-label="Technology stack">
            ${this.project.stack.map((item) => `<span class="showcase-chip showcase-chip-muted">${escapeHtml(item)}</span>`).join("")}
          </div>
        </header>
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
