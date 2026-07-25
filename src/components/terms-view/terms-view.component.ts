import {BindEvent, BaseElement, Component, HTML, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {ApplicationEventService} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {
  TERMS_MARKDOWN_RENDER_EVENT,
  TERMS_MARKDOWN_SOURCE_EVENT,
  type TermsMarkdownSource,
} from "@app/events/terms.events.ts";
import {TermsLoaderService, type TermsDocument} from "@app/service/terms-loader.service.ts";

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);

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

@Component({
  selector: "terms-view",
  shadow: false,
})
export class TermsViewComponent extends BaseElement {
  private readonly loader = new TermsLoaderService();
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private terms: TermsDocument | null = null;
  private request: AbortController | null = null;
  private frameId: number | null = null;
  private activeScope = "use";
  private loadError = "";

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.scheduleProgressRender();
    if (this.terms) {
      this.publishSource();
      return;
    }
    void this.loadTerms();
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.request?.abort();
    this.request = null;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  @WindowListener({event: "scroll"})
  onScroll(): void {
    this.scheduleProgressRender();
  }

  @OnEvent(TERMS_MARKDOWN_RENDER_EVENT)
  onMarkdownRender(): void {
    this.scheduleProgressRender();
  }

  @BindEvent({event: "click", id: "[data-terms-scope]"})
  onScopeClick(event: Event): void {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-terms-scope]");
    const target = button?.dataset.termsScope;
    if (!button || !target) {
      return;
    }

    event.preventDefault();
    this.activeScope = target;
    this.updateHTML();
    requestAnimationFrame(() => {
      const heading = document.getElementById(target);
      if (!heading) {
        return;
      }
      heading.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  }

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
      this.publishSource();
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

  private readonly scheduleProgressRender = (): void => {
    if (this.frameId !== null) {
      return;
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      const progressBar = this.querySelector<HTMLElement>("[data-terms-progress]");
      const sections = this.terms?.sections ?? [];
      const first = sections[0] ? this.querySelector<HTMLElement>(`#terms-section-${sections[0].id}`) : null;
      const lastSection = sections.at(-1);
      const last = lastSection ? this.querySelector<HTMLElement>(`#terms-section-${lastSection.id}`) : null;
      if (!progressBar || !first || !last) {
        return;
      }

      const start = first.getBoundingClientRect().top + window.scrollY;
      const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      const progress = end <= start ? 1 : Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
      progressBar.style.transform = `scaleX(${progress})`;
    });
  };

  render(): string {
    if (!this.terms) {
      return HTML`
        <main class="terms-shell terms-container">
          <p class="terms-status" role="status">${this.loadError || "Loading the terms and conditions…"}</p>
        </main>
      `;
    }

    const {metadata, sections} = this.terms;
    const summary = metadata.summary
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
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

    return HTML`
      <div class="terms-progress" data-terms-progress aria-hidden="true"></div>
      <main id="top" class="terms-shell terms-container" data-terms-page>
        <header class="terms-header">
          <div class="terms-chip-row">
            <span class="terms-chip">Terms</span>
            <span class="terms-chip terms-chip-muted">Version ${escapeHtml(metadata.version)}</span>
          </div>
          <h1>${escapeHtml(metadata.title)}</h1>
          <p class="terms-tagline">${escapeHtml(metadata.tagline)}</p>
          <div class="terms-proof" aria-label="Terms dates and jurisdiction">
            <span>Last updated <strong>${formatDate(metadata.updated)}</strong></span>
            <span>In effect from <strong>${formatDate(metadata.effective)}</strong></span>
            <span>Governed by the law of <strong>${escapeHtml(metadata.governingLaw)}</strong></span>
          </div>
          <section class="terms-summary" aria-labelledby="terms-summary-title">
            <p id="terms-summary-title" class="terms-eyebrow">The short version</p>
            <ul>${summary}</ul>
            <p class="terms-summary-note">${escapeHtml(metadata.summaryNote)}</p>
          </section>
        </header>

        <section class="terms-scope" aria-labelledby="terms-scope-title">
          <p id="terms-scope-title" class="terms-eyebrow">Jump to the part that’s about you</p>
          <div class="terms-scope-control" role="tablist" aria-label="Terms audience">
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
