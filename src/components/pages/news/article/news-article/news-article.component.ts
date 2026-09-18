import {ApplicationEventService, BaseElement, BeforeInit, Component, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {
  formatNewsDate,
  getNewsNote,
  getNewsNotes,
  getNewsSlug,
  labelForNewsKind,
  type NewsNote,
} from "@app/configs/news.config.ts";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {newsContent} from "@app/data/news-content.ts";
import {NEWS_MARKDOWN_SOURCE_EVENT, type NewsMarkdownSource} from "@app/events/news.events.ts";
import {NewsLoaderService} from "@app/service/news-loader.service.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";

const renderFigures = (note: NewsNote): string => note.figures?.length ? `
  <section class="news-article-block layout-section-sm layout-section-flush" aria-label="Measured outcomes">
    <dl class="news-figures layout-grid-3">
      ${note.figures.map((figure) => `<div><dt>${escapeHtml(figure.label)}</dt><dd class="news-number">${escapeHtml(figure.value)}</dd></div>`).join("")}
    </dl>
  </section>
` : "";

const renderReference = (note: NewsNote): string => note.reference ? `
  <div class="news-article-block">
    <div class="news-article-source layout-row layout-row-split">
      <span class="news-meta">Source of record</span>
      <a href="${escapeHtml(note.reference.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(note.reference.label)} <span aria-hidden="true">↗</span></a>
    </div>
  </div>
` : "";

const renderAdjacentNote = (note: NewsNote | undefined, direction: "previous" | "next"): string => note ? `
  <a class="news-step ${direction === "previous" ? "is-previous" : ""}" href="/news/${note.slug}">
    <p class="news-label">${direction === "previous" ? newsContent.article.previous : newsContent.article.next} · ${formatNewsDate(note.date, true)}</p>
    <p class="news-step-title">${direction === "previous" ? `<span aria-hidden="true">←</span> ` : ""}${escapeHtml(note.title)}${direction === "next" ? ` <span aria-hidden="true">→</span>` : ""}</p>
  </a>
` : "";

/**
 * Coordinates the `/news/:slug` reading surface from catalogue lookup to document load.
 * Metadata renders immediately from configuration, while Markdown crosses a feature-scoped
 * event boundary and request cancellation prevents stale routes from replacing current copy.
 *
 * Selector: `news-article`.
 */
@Component({selector: "news-article", shadow: false})
export class NewsArticleComponent extends BaseElement {
  readonly publisher = ApplicationEventService.getInstance().getPublisher();
  readonly loader = new NewsLoaderService();
  note: NewsNote | null = null;
  request: AbortController | null = null;
  loadError = "";
  hasHydratedArticle = false;
  progressFrame: number | null = null;

  /** Detects SSG output before hydration so an already-rendered document is not fetched twice. */
  @BeforeInit()
  beforeViewInit(): void {
    this.hasHydratedArticle = this.hasAttribute("data-dh-c")
      || this.querySelector("[data-news-document] .news-markdown-content") !== null;
  }

  /** Resolves the active note and starts its cancellable Markdown request. */
  @OnEvent("connected", true)
  initializeArticle(): void {
    const slug = getNewsSlug(window.location.pathname);
    this.note = getNewsNote(slug) ?? null;
    this.scheduleProgress();
    if (!this.note || this.hasHydratedArticle) {
      return;
    }

    void this.loadDocument(this.note);
  }

  /** Releases transport and animation-frame work when navigation removes the article. */
  @OnEvent("disconnected", true)
  cleanupArticle(): void {
    this.request?.abort();
    this.request = null;
    if (this.progressFrame !== null) {
      cancelAnimationFrame(this.progressFrame);
      this.progressFrame = null;
    }
  }

  /** Coalesces article-body progress updates into the next animation frame. */
  @WindowListener({event: ["scroll", "resize"]})
  scheduleProgress(): void {
    if (import.meta.env.SSR || this.progressFrame !== null) {
      return;
    }

    this.progressFrame = requestAnimationFrame(() => {
      this.progressFrame = null;
      const article = this.querySelector<HTMLElement>("[data-news-article-body]");
      const progress = this.querySelector<HTMLElement>("[data-news-progress]");
      if (!article || !progress) {
        return;
      }

      const bounds = article.getBoundingClientRect();
      const total = bounds.height - window.innerHeight;
      const amount = total > 0 ? -bounds.top / total : bounds.bottom < window.innerHeight ? 1 : 0;
      const clampedAmount = Math.min(1, Math.max(0, amount));
      progress.style.transform = `scaleX(${clampedAmount})`;
    });
  }

  /** Fetches one note and publishes it only while the originating route is still active. */
  async loadDocument(note: NewsNote): Promise<void> {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;

    try {
      const markdown = await this.loader.load(note, request.signal);
      if (request.signal.aborted || this.request !== request) {
        return;
      }

      await this.publisher.publishAsync({
        name: NEWS_MARKDOWN_SOURCE_EVENT,
        data: {markdown} satisfies NewsMarkdownSource,
      });
      this.scheduleProgress();
    } catch {
      if (request.signal.aborted || this.request !== request) {
        return;
      }

      this.loadError = newsContent.article.loadError;
      this.updateHTML();
    }
  }

  /** Renders the configured note, chronological navigation, and same-kind follow-ons. */
  render() {
    const note = this.note ?? getNewsNote(getNewsSlug(window.location.pathname)) ?? null;
    if (!note) {
      return html`${trustedHTML(`
        <main class="layout-reading layout-section-hero news-article-missing">
          <p class="news-eyebrow">${newsContent.article.notFoundEyebrow}</p>
          <h1 class="type-section">${newsContent.article.notFoundTitle}</h1>
          <a class="app-link app-link--button app-link--ink" href="/news">${newsContent.article.notFoundAction}</a>
        </main>
      `)}`;
    }

    const notes = getNewsNotes();
    const noteIndex = notes.findIndex((item) => item.slug === note.slug);
    const previousNote = notes[noteIndex + 1];
    const nextNote = notes[noteIndex - 1];
    const sameKindNotes = notes.filter((item) => item.slug !== note.slug && item.kind === note.kind);
    const otherNotes = notes.filter((item) => item.slug !== note.slug && item.kind !== note.kind);
    const moreNotes = [...sameKindNotes, ...otherNotes].slice(0, 3);
    const documentMarkup = this.loadError
      ? `<div class="news-note-prose"><p class="news-load-error">${escapeHtml(this.loadError)} <a href="/news">${newsContent.article.back}</a>.</p></div>`
      : `<div class="news-note-prose layout-section layout-section-flush" data-news-document aria-busy="true"><news-markdown-view theme="${portfolioMarkdownTheme.name}" color="${portfolioMarkdownColor}"><p class="news-meta">${newsContent.article.loading}</p></news-markdown-view></div>`;

    return html`${trustedHTML(`
      <div class="news-reading-progress" data-news-progress aria-hidden="true"></div>
      <main>
        <article data-news-article-body>
          <header class="layout-section-hero">
            <div class="layout-page">
              <a class="news-back-link" href="/news"><span aria-hidden="true">←</span> ${newsContent.article.back}</a>
            </div>
            <div class="news-article-block layout-grid layout-section-sm text-center">
              <div class="news-article-byline layout-row layout-row-tight justify-center">
                <span class="news-tag">${labelForNewsKind(note.kind)}</span>
                <time class="news-meta news-number" datetime="${note.date}">${formatNewsDate(note.date)}</time>
                <span class="news-meta">·</span>
                <span class="news-meta">${note.minutes} min read</span>
              </div>
              <h1 class="news-article-title type-section">${escapeHtml(note.title)}</h1>
              <p class="news-lede type-lede layout-center">${escapeHtml(note.summary)}</p>
            </div>
          </header>
          ${renderFigures(note)}
          ${documentMarkup}
          ${renderReference(note)}
        </article>

        <nav class="news-article-block layout-section" aria-label="Adjacent Dispatch notes">
          ${renderAdjacentNote(previousNote, "previous")}
          ${renderAdjacentNote(nextNote, "next")}
        </nav>

        ${moreNotes.length ? `<section class="news-article-block layout-section layout-section-flush" aria-labelledby="news-more-heading"><h2 class="news-label" id="news-more-heading">${newsContent.article.more}</h2><div class="news-more-list">${moreNotes.map((item) => `<a class="news-more-row layout-row layout-row-split" href="/news/${item.slug}"><span>${escapeHtml(item.title)}</span><time class="news-meta news-number" datetime="${item.date}">${formatNewsDate(item.date, true)}</time></a>`).join("")}</div></section>` : ""}

        <div class="news-article-subscription layout-content layout-section-end">
          <blog-subscription heading="${newsContent.article.subscription.title}" description="${newsContent.article.subscription.copy}" aria-label-text="${newsContent.article.subscription.ariaLabel}" button-variant="accent"></blog-subscription>
        </div>
      </main>
    `)}`;
  }
}
