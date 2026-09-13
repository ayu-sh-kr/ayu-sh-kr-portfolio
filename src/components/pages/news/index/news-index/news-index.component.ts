import {BaseElement, BindEvent, Component, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {
  formatNewsDate,
  getNewsNotes,
  labelForNewsKind,
  newsFilters,
  type NewsKind,
  type NewsNote,
} from "@app/configs/news.config.ts";
import {newsContent} from "@app/data/news-content.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";

type NewsMonth = {
  id: string;
  label: string;
  notes: readonly NewsNote[];
};

const filterFromHash = (): NewsKind | "all" => {
  const match = /^#\/(shipped|infra|reading|take)$/.exec(window.location.hash);
  return match?.[1] as NewsKind | undefined ?? "all";
};

const groupNotesByMonth = (notes: readonly NewsNote[]): readonly NewsMonth[] => {
  const groups = new Map<string, NewsNote[]>();
  notes.forEach((note) => {
    const monthKey = note.date.slice(0, 7);
    const group = groups.get(monthKey) ?? [];
    group.push(note);
    groups.set(monthKey, group);
  });

  return Array.from(groups, ([monthKey, monthNotes]) => ({
    id: `news-month-${monthKey}`,
    label: new Intl.DateTimeFormat("en-US", {month: "long", year: "numeric"}).format(new Date(`${monthKey}-01T00:00:00`)),
    notes: monthNotes,
  }));
};

const renderSummary = (summary: string): string =>
  escapeHtml(summary).replace(/`([^`]+)`/g, "<code>$1</code>");

const renderNote = (note: NewsNote, latestSlug: string): string => `
  <article class="news-note" data-news-note data-kind="${note.kind}">
    <div class="news-note-head layout-row layout-row-tight">
      <time class="news-meta news-number" datetime="${note.date}">${formatNewsDate(note.date, true)}</time>
      ${note.slug === latestSlug ? `<span class="news-live"><span class="news-live-dot" aria-hidden="true"></span>Latest</span>` : ""}
    </div>
    <h3 class="news-note-title"><a href="/news/${note.slug}">${escapeHtml(note.title)}</a></h3>
    <p class="news-note-body">${renderSummary(note.summary)}</p>
    <div class="news-note-foot layout-row">
      <span class="news-tag">${labelForNewsKind(note.kind)}</span>
      ${note.reference ? `<a class="news-source-link" href="${escapeHtml(note.reference.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(note.reference.label)} <span aria-hidden="true">↗</span></a>` : ""}
    </div>
  </article>
`;

const renderMonth = (month: NewsMonth, latestSlug: string): string => `
  <section class="news-month" id="${month.id}" aria-labelledby="${month.id}-heading" data-news-month>
    <div class="news-month-heading"><h2 class="news-label" id="${month.id}-heading">${month.label}</h2></div>
    ${month.notes.map((note) => renderNote(note, latestSlug)).join("")}
  </section>
`;

/**
 * Owns the complete `/news` feed and its single floating filter interaction.
 * Notes stay fully readable in the initial HTML; filtering changes visibility
 * in place so the feed remains useful before hydration and during SSG.
 *
 * Selector: `news-index`.
 */
@Component({selector: "news-index", shadow: false})
export class NewsIndexComponent extends BaseElement {
  readonly notes = getNewsNotes();
  readonly months = groupNotesByMonth(this.notes);
  currentFilter: NewsKind | "all" = "all";
  revealObserver: IntersectionObserver | null = null;
  monthObserver: IntersectionObserver | null = null;

  /** Activates filtering, month tracking, and the reduced-motion-aware feed reveal. */
  @OnEvent("connected", true)
  initializeFeed(): void {
    this.currentFilter = filterFromHash();
    this.applyFilter(this.currentFilter, false);
    this.observeReveals();
    this.observeMonths();
  }

  /** Releases observers owned by this route instance. */
  @OnEvent("disconnected", true)
  cleanupFeed(): void {
    this.revealObserver?.disconnect();
    this.monthObserver?.disconnect();
    this.revealObserver = null;
    this.monthObserver = null;
  }

  /** Toggles the only filter control while keeping its accessibility state synchronized. */
  @BindEvent({event: "click", id: "[data-news-dock-toggle]"})
  toggleDock(): void {
    const toggle = this.querySelector<HTMLButtonElement>("[data-news-dock-toggle]");
    const isOpen = toggle?.getAttribute("aria-expanded") !== "true";
    this.setDockOpen(isOpen);
  }

  /** Applies a selected editorial kind and closes the floating panel. */
  @BindEvent({event: "click", id: "[data-news-filter]"})
  selectFilter(event: Event): void {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-news-filter]");
    const filter = button?.dataset.newsFilter as NewsKind | "all" | undefined;
    if (!filter) {
      return;
    }

    this.applyFilter(filter, true);
  }

  /** Closes the dock after an in-page month destination is selected. */
  @BindEvent({event: "click", id: "[data-news-month-link]"})
  selectMonth(): void {
    this.setDockOpen(false);
  }

  /** Supports Escape and the demo's `f` shortcut without stealing keystrokes from editable controls. */
  @WindowListener({event: "keydown"})
  handleKeyboard(event: KeyboardEvent): void {
    const panel = this.querySelector<HTMLElement>("[data-news-dock-panel]");
    const toggle = this.querySelector<HTMLButtonElement>("[data-news-dock-toggle]");
    if (event.key === "Escape" && panel && !panel.hidden) {
      this.setDockOpen(false);
      toggle?.focus();
      return;
    }

    const active = document.activeElement as HTMLElement | null;
    const isTyping = active?.matches("input, textarea, select, [contenteditable='true']") ?? false;
    if (event.key.toLowerCase() !== "f" || isTyping || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    event.preventDefault();
    this.setDockOpen(true);
    const firstDockFilter = this.querySelector<HTMLButtonElement>("[data-news-dock-panel] [data-news-filter]");
    firstDockFilter?.focus();
  }

  /** Dismisses the floating panel when a pointer interaction lands elsewhere. */
  @WindowListener({event: "pointerdown"})
  closeDockOutside(event: PointerEvent): void {
    const panel = this.querySelector<HTMLElement>("[data-news-dock-panel]");
    const dock = this.querySelector<HTMLElement>("[data-news-dock]");
    if (!panel?.hidden && event.target instanceof Node && !dock?.contains(event.target)) {
      this.setDockOpen(false);
    }
  }

  /** Synchronizes the panel's native hidden state and toggle disclosure state. */
  setDockOpen(isOpen: boolean): void {
    const panel = this.querySelector<HTMLElement>("[data-news-dock-panel]");
    const toggle = this.querySelector<HTMLButtonElement>("[data-news-dock-toggle]");
    if (!panel || !toggle) {
      return;
    }

    panel.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  /** Filters notes and removes empty month destinations from both the feed and dock. */
  applyFilter(filter: NewsKind | "all", closeDock: boolean): void {
    this.currentFilter = filter;
    const notes = Array.from(this.querySelectorAll<HTMLElement>("[data-news-note]"));
    let shown = 0;
    notes.forEach((note) => {
      const isVisible = filter === "all" || note.dataset.kind === filter;
      note.hidden = !isVisible;
      if (isVisible) {
        shown += 1;
      }
    });

    this.querySelectorAll<HTMLButtonElement>("[data-news-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.newsFilter === filter));
    });
    this.querySelectorAll<HTMLElement>("[data-news-month]").forEach((month) => {
      const isVisible = month.querySelector("[data-news-note]:not([hidden])") !== null;
      month.hidden = !isVisible;
      const monthLink = this.querySelector<HTMLElement>(`[data-news-month-link="${month.id}"]`);
      if (monthLink) {
        monthLink.hidden = !isVisible;
      }
    });

    const label = newsFilters.find((item) => item.value === filter)?.label ?? newsFilters[0].label;
    const dockLabel = this.querySelector<HTMLElement>("[data-news-dock-label]");
    const tally = this.querySelector<HTMLElement>("[data-news-tally]");
    const toggle = this.querySelector<HTMLButtonElement>("[data-news-dock-toggle]");
    const empty = this.querySelector<HTMLElement>("[data-news-empty]");
    if (dockLabel) dockLabel.textContent = label;
    if (tally) tally.textContent = String(shown);
    if (empty) empty.hidden = shown !== 0;
    toggle?.setAttribute("data-filtered", String(filter !== "all"));
    toggle?.setAttribute("aria-label", `${shown} ${shown === 1 ? "note" : "notes"} shown. ${label} filter. Open filters.`);

    const hasFilterHash = /^#\/(shipped|infra|reading|take)$/.test(window.location.hash);
    if (closeDock || filter !== "all" || hasFilterHash) {
      const hash = filter === "all" ? "" : `#/${filter}`;
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
    if (closeDock) {
      this.setDockOpen(false);
    }
  }

  /** Reveals feed rows once, with a static fallback for reduced motion and older browsers. */
  observeReveals(): void {
    const notes = Array.from(this.querySelectorAll<HTMLElement>("[data-news-note]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      notes.forEach((note) => note.classList.add("is-visible"));
      return;
    }

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        this.revealObserver?.unobserve(entry.target);
      });
    }, {threshold: 0.15});
    notes.forEach((note) => this.revealObserver?.observe(note));
  }

  /** Marks the month currently crossing the reading band inside the dock. */
  observeMonths(): void {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    this.monthObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        this.querySelectorAll<HTMLElement>("[data-news-month-link]").forEach((link) => {
          link.setAttribute("aria-current", String(link.dataset.newsMonthLink === entry.target.id));
        });
      });
    }, {rootMargin: "-20% 0px -70% 0px"});
    this.querySelectorAll<HTMLElement>("[data-news-month]").forEach((month) => this.monthObserver?.observe(month));
  }

  /** Renders the Dispatch feed, shared subscription boundary, blog hand-off, and filter dock. */
  render(): string {
    const latestSlug = this.notes[0]?.slug ?? "";
    return `
      <main class="news-index-main">
        <news-hero></news-hero>

        <section class="layout-content layout-section" aria-label="Dispatch notes">
          ${this.months.map((month) => renderMonth(month, latestSlug)).join("")}
          <p class="news-empty news-lede type-lede" data-news-empty hidden>${newsContent.index.empty} <button type="button" class="news-filter" data-news-filter="all" aria-pressed="false">Show all notes</button></p>
        </section>

        <div class="news-subscription-wrap layout-content layout-section">
          <blog-subscription heading="${newsContent.index.subscription.title}" description="${newsContent.index.subscription.copy}" aria-label-text="${newsContent.index.subscription.ariaLabel}" button-variant="accent"></blog-subscription>
        </div>

        <section class="news-blog-handoff">
          <div class="layout-content layout-row layout-row-split layout-section-end">
            <p class="news-lede type-lede">${newsContent.index.blogPrompt}</p>
            <a class="app-link app-link--button app-link--ink" href="/blog">${newsContent.index.blogAction} <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <div class="news-dock layout-pinned-bottom" data-news-dock>
          <div class="news-dock-panel" id="news-filter-panel" data-news-dock-panel hidden>
            <div>
              <p class="news-label">${newsContent.index.filterLabel}</p>
              <div class="layout-row layout-row-tight">
                ${newsFilters.map((filter) => `<button type="button" class="news-filter" data-news-filter="${filter.value}" aria-pressed="${filter.value === "all"}">${filter.label}</button>`).join("")}
              </div>
            </div>
            <div class="news-dock-months">
              <p class="news-label">${newsContent.index.monthLabel}</p>
              <nav aria-label="Dispatch months">
                ${this.months.map((month) => `<a class="news-month-link" href="#${month.id}" data-news-month-link="${month.id}"><span>${month.label}</span><span class="news-number">${month.notes.length}</span></a>`).join("")}
              </nav>
            </div>
          </div>
          <button type="button" class="news-dock-toggle" data-news-dock-toggle data-filtered="false" aria-expanded="false" aria-controls="news-filter-panel">
            <span class="news-dock-dot" aria-hidden="true"></span>
            <span data-news-dock-label>All notes</span>
            <span class="news-dock-count news-number" data-news-tally>${this.notes.length}</span>
            <span class="news-dock-chevron" aria-hidden="true"></span>
          </button>
        </div>
      </main>
    `;
  }
}
