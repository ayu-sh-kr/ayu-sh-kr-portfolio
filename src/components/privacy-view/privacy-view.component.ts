import {BindEvent, BaseElement, Component, HTML, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {ApplicationEventService} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {
  PRIVACY_MARKDOWN_RENDER_EVENT,
  PRIVACY_MARKDOWN_SOURCE_EVENT,
  type PrivacyMarkdownSource,
} from "@app/events/privacy.events.ts";
import {PrivacyLoaderService, type PrivacyDocument} from "@app/service/privacy-loader.service.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {MarkdownSourceLifecycle} from "@app/utils/markdown-lifecycle.utils.ts";

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
  selector: "privacy-view",
  shadow: false,
})
export class PrivacyViewComponent extends BaseElement {
  private readonly loader = new PrivacyLoaderService();
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private readonly sourceLifecycle = new MarkdownSourceLifecycle(this);
  private policy: PrivacyDocument | null = null;
  private request: AbortController | null = null;
  private frameId: number | null = null;
  private activeScope = "visit";
  private loadError = "";

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.scheduleProgressRender();
    if (this.policy) {
      this.sourceLifecycle.schedule(() => this.publishSource());
      return;
    }
    void this.loadPolicy();
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.request?.abort();
    this.request = null;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.sourceLifecycle.disconnect();
  }

  @WindowListener({event: "scroll"})
  onScroll(): void {
    this.scheduleProgressRender();
  }

  @OnEvent(PRIVACY_MARKDOWN_RENDER_EVENT)
  onMarkdownRender(): void {
    this.scheduleProgressRender();
  }

  @BindEvent({event: "click", id: "[data-privacy-scope]"})
  onScopeClick(event: Event): void {
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

  private readonly scheduleProgressRender = (): void => {
    if (this.frameId !== null) {
      return;
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      const progressBar = this.querySelector<HTMLElement>("[data-privacy-progress]");
      const sections = this.policy?.sections ?? [];
      const first = sections[0] ? this.querySelector<HTMLElement>(`#privacy-section-${sections[0].id}`) : null;
      const lastSection = sections.at(-1);
      const last = lastSection ? this.querySelector<HTMLElement>(`#privacy-section-${lastSection.id}`) : null;
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
