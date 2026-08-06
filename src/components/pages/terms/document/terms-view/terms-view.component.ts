import {ApplicationEventService, BindEvent, BaseElement, Component, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {html} from "@ayu-sh-kr/dota-rendering";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {
  TERMS_MARKDOWN_RENDER_EVENT,
  TERMS_MARKDOWN_SOURCE_EVENT,
  type TermsMarkdownSource,
} from "@app/events/terms.events.ts";
import {TermsLoaderService, type TermsDocument} from "@app/service/terms-loader.service.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {
  MarkdownProgressLifecycle,
  MarkdownSourceLifecycle,
} from "@app/utils/markdown-lifecycle.utils.ts";

/** Formats an authored ISO date for the terms metadata row without timezone drift. */
const formatDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

/**
 * Loads and presents the terms and conditions document.
 *
 * After connecting, the view loads authored terms through `TermsLoaderService`,
 * renders the document shell, and publishes Markdown to `terms-markdown-view`.
 * It also owns audience-scope scrolling and reading progress, and aborts
 * pending work when disconnected.
 *
 * Selector: `terms-view`.
 */
@Component({
  selector: "terms-view",
  shadow: false,
})
export class TermsViewComponent extends BaseElement {
  /** Loads and normalizes the authored terms document. */
  private readonly loader = new TermsLoaderService();
  /** Publishes terms source and completed-section events to child components. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  /** Shared helper for the terms reading-progress indicator. */
  private readonly progressLifecycle = new MarkdownProgressLifecycle(this);
  /** Defers source publication until the Markdown child is connected. */
  private readonly sourceLifecycle = new MarkdownSourceLifecycle(this);
  /** Loaded terms document, or null while loading or after an unavailable response. */
  private terms: TermsDocument | null = null;
  /** Abort controller for the active terms request. */
  private request: AbortController | null = null;
  /** ID of the audience section selected by the scope controls. */
  private activeScope = "use";
  /** User-facing load error shown in place of the terms shell. */
  private loadError = "";

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  /** Starts progress tracking and loads or republishes the terms after connect. */
  initializeTermsView(): void {
    this.scheduleProgressRender();
    if (this.terms) {
      this.sourceLifecycle.schedule(() => this.publishSource());
      requestAnimationFrame(() => this.positionScopeThumb());
      return;
    }
    void this.loadTerms();
  }

  @OnEvent("disconnected", true)
  /** Aborts loading and disconnects both document lifecycle helpers. */
  cleanupTermsView(): void {
    this.request?.abort();
    this.request = null;
    this.progressLifecycle.disconnect();
    this.sourceLifecycle.disconnect();
  }

  @WindowListener({event: "scroll"})
  /** Schedules a lightweight terms progress update for the next animation frame. */
  scheduleProgressRender(): void {
    this.progressLifecycle.scheduleSectionProgress(
      "[data-terms-progress]",
      this.terms?.sections ?? [],
      "terms-section-",
    );
  }

  @WindowListener({event: "resize"})
  /** Keeps the scope switch thumb aligned after its buttons change size. */
  positionScopeThumbOnResize(): void {
    this.positionScopeThumb();
  }

  @OnEvent(TERMS_MARKDOWN_RENDER_EVENT)
  /** Refreshes terms progress after Markdown has created the section wrappers. */
  refreshProgressAfterMarkdown(): void {
    this.scheduleProgressRender();
  }

  @BindEvent({event: "click", id: "[data-terms-scope]"})
  /** Updates the selected audience and scrolls to its corresponding section. */
  scrollToScope(event: Event): void {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-terms-scope]");
    const target = button?.dataset.termsScope;
    if (!button || !target) {
      return;
    }

    event.preventDefault();
    this.activeScope = target;
    this.querySelectorAll<HTMLButtonElement>("[data-terms-scope]").forEach((scopeButton) => {
      const isActive = scopeButton.dataset.termsScope === target;
      scopeButton.classList.toggle("is-active", isActive);
      scopeButton.setAttribute("aria-pressed", String(isActive));
    });
    this.positionScopeThumb();
    requestAnimationFrame(() => {
      const heading = document.getElementById(target);
      if (!heading) {
        return;
      }
      heading.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  /** Loads the terms document and schedules its source for the Markdown child. */
  private async loadTerms(): Promise<void> {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;

    try {
      const terms = await this.loader.load(request.signal);
      if (request.signal.aborted || this.request !== request) {
        return;
      }

      this.terms = terms;
      this.activeScope = terms.metadata.switches[0]?.target ?? terms.sections[0]?.id ?? "";
      this.loadError = "";
      this.updateHTML();
      requestAnimationFrame(() => this.positionScopeThumb());
      this.sourceLifecycle.schedule(() => this.publishSource());
      this.scheduleProgressRender();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (this.request !== request) {
        return;
      }

      this.loadError = "The terms and conditions could not be loaded right now.";
      this.updateHTML();
    }
  }

  /** Positions the demo-matched thumb below the currently selected scope button. */
  private positionScopeThumb(): void {
    const control = this.querySelector<HTMLElement>(".terms-scope-control");
    const thumb = this.querySelector<HTMLElement>("[data-terms-scope-thumb]");
    const activeButton = this.querySelector<HTMLButtonElement>(".terms-scope-button.is-active");
    if (!control || !thumb || !activeButton) {
      return;
    }

    thumb.style.inlineSize = `${activeButton.offsetWidth}px`;
    thumb.style.transform = `translateX(${activeButton.offsetLeft - 4}px)`;
  }

  /** Publishes the loaded Markdown and section metadata to the child view. */
  private publishSource(): void {
    if (!this.terms) {
      return;
    }

    void this.publisher.publishAsync({
      name: TERMS_MARKDOWN_SOURCE_EVENT,
      data: {
        markdown: this.terms.markdown,
        sections: this.terms.sections,
      } satisfies TermsMarkdownSource,
    });
  }

  /** Renders the loading/error state or the complete terms reader shell. */
  render() {
    if (!this.terms) {
      return html`
        <main class="terms-shell layout-page layout-section-hero">
          <p class="terms-status" role="status">${this.loadError || "Loading the terms and conditions…"}</p>
        </main>
      `;
    }

    const {metadata} = this.terms;
    const switches = metadata.switches.length
      ? metadata.switches
        .map((item) => `
          <button type="button" class="terms-scope-button ${item.target === this.activeScope ? "is-active" : ""}"
                  data-terms-scope="${escapeHtml(item.target)}" aria-pressed="${item.target === this.activeScope}">
            ${escapeHtml(item.label)}
          </button>
        `)
        .join("")
      : "";
    const related = metadata.related
      .map((item) => `
        <a class="terms-related-card" href="${escapeHtml(item.href)}">
          <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.blurb)}</small></span>
          <span aria-hidden="true">→</span>
        </a>
      `)
      .join("");

    return html`
      <div class="terms-progress" data-terms-progress aria-hidden="true"></div>
      <main id="top" class="terms-shell layout-page layout-section-hero" data-terms-page>
        <terms-document-header metadata="${escapeHtml(JSON.stringify(metadata))}"></terms-document-header>

        <section class="terms-scope" aria-labelledby="terms-scope-title">
          <p id="terms-scope-title" class="terms-eyebrow">Jump to the part that’s about you</p>
          <div class="terms-scope-control" role="tablist" aria-label="Terms audience">
            <span class="terms-scope-thumb" data-terms-scope-thumb aria-hidden="true"></span>
            ${switches}
          </div>
        </section>

        <div class="terms-reader-layout">
          <terms-toc></terms-toc>
          <article class="terms-prose" data-terms-markdown aria-busy="true">
            <terms-markdown-view theme="${escapeHtml("portfolio")}" color="${escapeHtml("primary")}">
              <p class="terms-status">Loading the terms text…</p>
            </terms-markdown-view>
          </article>
        </div>

        <footer class="terms-footer">
          <div class="terms-related-grid">${related}</div>
          <div class="terms-footer-meta">
            <span>Terms &amp; Conditions · Version ${escapeHtml(metadata.version)} · Updated ${formatDate(metadata.updated)}</span>
            <a href="#top" data-terms-top>Back to top ↑</a>
          </div>
        </footer>
      </main>
    `;
  }
}
