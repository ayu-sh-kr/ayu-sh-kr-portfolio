import {ApplicationEventService, BindEvent, BaseElement, Component, HTML, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {
  PRIVACY_MARKDOWN_RENDER_EVENT,
  PRIVACY_MARKDOWN_SOURCE_EVENT,
  type PrivacyMarkdownSource,
} from "@app/events/privacy.events.ts";
import {PrivacyLoaderService, type PrivacyDocument} from "@app/service/privacy-loader.service.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {
  MarkdownProgressLifecycle,
  MarkdownSourceLifecycle,
} from "@app/utils/markdown-lifecycle.utils.ts";

/** Formats an authored ISO date for the policy metadata row without timezone drift. */
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
 * Loads and presents the privacy policy document.
 *
 * After connecting, the view loads the authored document through
 * `PrivacyLoaderService`, renders the policy shell, and publishes its Markdown
 * to `privacy-markdown-view`. It also owns audience-scope scrolling and reading
 * progress, and aborts pending work when disconnected.
 *
 * Selector: `privacy-view`.
 */
@Component({
  selector: "privacy-view",
  shadow: false,
})
export class PrivacyViewComponent extends BaseElement {
  /** Loads and normalizes the authored policy document. */
  private readonly loader = new PrivacyLoaderService();
  /** Publishes policy source and completed-section events to child components. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  /** Shared helper for the policy reading-progress indicator. */
  private readonly progressLifecycle = new MarkdownProgressLifecycle(this);
  /** Defers source publication until the Markdown child is connected. */
  private readonly sourceLifecycle = new MarkdownSourceLifecycle(this);
  /** Loaded policy document, or null while loading or after an unavailable response. */
  private policy: PrivacyDocument | null = null;
  /** Abort controller for the active policy request. */
  private request: AbortController | null = null;
  /** ID of the audience section selected by the scope controls. */
  private activeScope = "visit";
  /** User-facing load error shown in place of the policy shell. */
  private loadError = "";

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  /** Starts progress tracking and loads or republishes the policy after connect. */
  initializePrivacyView(): void {
    this.scheduleProgressRender();
    if (this.policy) {
      this.sourceLifecycle.schedule(() => this.publishSource());
      requestAnimationFrame(() => this.positionScopeThumb());
      return;
    }
    void this.loadPolicy();
  }

  @OnEvent("disconnected", true)
  /** Aborts loading and disconnects both document lifecycle helpers. */
  cleanupPrivacyView(): void {
    this.request?.abort();
    this.request = null;
    this.progressLifecycle.disconnect();
    this.sourceLifecycle.disconnect();
  }

  @WindowListener({event: "scroll"})
  /** Schedules a lightweight policy progress update for the next animation frame. */
  scheduleProgressRender(): void {
    this.progressLifecycle.scheduleSectionProgress(
      "[data-privacy-progress]",
      this.policy?.sections ?? [],
      "privacy-section-",
    );
  }

  @WindowListener({event: "resize"})
  /** Keeps the scope switch thumb aligned after its buttons change size. */
  positionScopeThumbOnResize(): void {
    this.positionScopeThumb();
  }

  @OnEvent(PRIVACY_MARKDOWN_RENDER_EVENT)
  /** Refreshes policy progress after Markdown has created the section wrappers. */
  refreshProgressAfterMarkdown(): void {
    this.scheduleProgressRender();
  }

  @BindEvent({event: "click", id: "[data-privacy-scope]"})
  /** Updates the selected audience and scrolls to its corresponding section. */
  scrollToScope(event: Event): void {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-privacy-scope]");
    const target = button?.dataset.privacyScope;
    if (!button || !target) {
      return;
    }

    event.preventDefault();
    this.activeScope = target;
    this.querySelectorAll<HTMLButtonElement>("[data-privacy-scope]").forEach((scopeButton) => {
      const isActive = scopeButton.dataset.privacyScope === target;
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

  /** Loads the policy document and schedules its source for the Markdown child. */
  private async loadPolicy(): Promise<void> {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;

    try {
      const policy = await this.loader.load(request.signal);
      if (request.signal.aborted || this.request !== request) {
        return;
      }

      this.policy = policy;
      this.activeScope = policy.metadata.switches[0]?.target ?? policy.sections[0]?.id ?? "";
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

      this.loadError = "The privacy policy could not be loaded right now.";
      this.updateHTML();
    }
  }

  /** Positions the demo-matched thumb below the currently selected scope button. */
  private positionScopeThumb(): void {
    const control = this.querySelector<HTMLElement>(".privacy-scope-control");
    const thumb = this.querySelector<HTMLElement>("[data-privacy-scope-thumb]");
    const activeButton = this.querySelector<HTMLButtonElement>(".privacy-scope-button.is-active");
    if (!control || !thumb || !activeButton) {
      return;
    }

    thumb.style.inlineSize = `${activeButton.offsetWidth}px`;
    thumb.style.transform = `translateX(${activeButton.offsetLeft - 4}px)`;
  }

  /** Publishes the loaded Markdown and section metadata to the child view. */
  private publishSource(): void {
    if (!this.policy) {
      return;
    }

    void this.publisher.publishAsync({
      name: PRIVACY_MARKDOWN_SOURCE_EVENT,
      data: {
        markdown: this.policy.markdown,
        sections: this.policy.sections,
      } satisfies PrivacyMarkdownSource,
    });
  }

  /** Renders the loading/error state or the complete policy reader shell. */
  render(): string {
    if (!this.policy) {
      return HTML`
        <main class="privacy-shell privacy-container">
          <p class="privacy-status" role="status">${this.loadError || "Loading the privacy policy…"}</p>
        </main>
      `;
    }

    const {metadata, sections} = this.policy;
    const summary = metadata.summary
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
    const switches = metadata.switches.length
      ? metadata.switches
        .map((item) => `
          <button type="button" class="privacy-scope-button ${item.target === this.activeScope ? "is-active" : ""}"
                  data-privacy-scope="${escapeHtml(item.target)}" aria-pressed="${item.target === this.activeScope}">
            ${escapeHtml(item.label)}
          </button>
        `)
        .join("")
      : "";
    const related = metadata.related
      .map((item) => `
        <a class="privacy-related-card" href="${escapeHtml(item.href)}">
          <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.blurb)}</small></span>
          <span aria-hidden="true">→</span>
        </a>
      `)
      .join("");

    return HTML`
      <div class="privacy-progress" data-privacy-progress aria-hidden="true"></div>
      <main id="top" class="privacy-shell privacy-container" data-privacy-page>
        <header class="privacy-header">
          <div class="privacy-chip-row">
            <span class="privacy-chip">Privacy</span>
            <span class="privacy-chip privacy-chip-muted">Version ${escapeHtml(metadata.version)}</span>
          </div>
          <h1>${escapeHtml(metadata.title)}</h1>
          <p class="privacy-tagline">${escapeHtml(metadata.tagline)}</p>
          <div class="privacy-proof" aria-label="Policy dates and scope">
            <span>Last updated <strong>${formatDate(metadata.updated)}</strong></span>
            <span>In effect from <strong>${formatDate(metadata.effective)}</strong></span>
            <span>Applies to <strong>${escapeHtml(metadata.applies)}</strong></span>
          </div>
          <section class="privacy-summary" aria-labelledby="privacy-summary-title">
            <p id="privacy-summary-title" class="privacy-eyebrow">The short version</p>
            <ul>${summary}</ul>
            <p class="privacy-summary-note">${escapeHtml(metadata.summaryNote)}</p>
          </section>
        </header>

        <section class="privacy-scope" aria-labelledby="privacy-scope-title">
          <p id="privacy-scope-title" class="privacy-eyebrow">Read the part that’s about you</p>
          <div class="privacy-scope-control" role="tablist" aria-label="Privacy policy audience">
            <span class="privacy-scope-thumb" data-privacy-scope-thumb aria-hidden="true"></span>
            ${switches}
          </div>
        </section>

        <div class="privacy-reader-layout">
          <privacy-toc></privacy-toc>
          <article class="privacy-prose" data-privacy-markdown aria-busy="true">
            <privacy-markdown-view theme="${escapeHtml("portfolio")}" color="${escapeHtml("primary")}">
              <p class="privacy-status">Loading the policy text…</p>
            </privacy-markdown-view>
          </article>
        </div>

        <footer class="privacy-footer">
          <div class="privacy-related-grid">${related}</div>
          <div class="privacy-footer-meta">
            <span>Privacy Policy · Version ${escapeHtml(metadata.version)} · Updated ${formatDate(metadata.updated)}</span>
            <a href="#top" data-privacy-top>Back to top ↑</a>
          </div>
        </footer>
      </main>
    `;
  }
}
