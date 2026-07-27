import {
  applyMarkdownTheme,
  getSelectionClass,
  MDService,
  MdViewComponent,
  THEMES,
  type ColorName,
} from "@ayu-sh-kr/dota-md";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";

const HASH_PREFIX_LENGTH = 1;
const COPY_RESET_DELAY = 1400;
const SKELETON_TIMEOUT = 9000;

/** Coordinates rendering, theme presentation, scrolling, reveals, tables, and copy feedback for a Markdown viewer. */
export class MarkdownLifecycleUtils {
  private readonly copyResetTimers = new Map<HTMLElement, number>();
  private hashFrameId: number | null = null;
  private observer: IntersectionObserver | null = null;
  private skeletonTimeoutId: number | null = null;

  /**
   * Creates lifecycle helpers for the supplied Markdown view.
   *
   * @param view - Markdown view whose content and attributes are managed.
   */
  constructor(private readonly view: MdViewComponent) {}

  /** Captures the view's authored child markup as initial Markdown-view content when no content is set. */
  captureInitialContent(): void {
    if (!this.view.content) {
      this.view.content = this.view.innerHTML;
    }
  }

  /** Starts the bounded loading window for the article skeleton. */
  startSkeletonTimeout(): void {
    this.clearSkeletonTimeout();
    this.skeletonTimeoutId = window.setTimeout(() => {
      this.skeletonTimeoutId = null;
      const layer = this.view.querySelector<HTMLElement>("[data-markdown-skeleton]");
      const content = this.view.querySelector<HTMLElement>("[data-markdown-skeleton-content]");
      const status = this.view.querySelector<HTMLElement>("[data-markdown-skeleton-status]");
      layer?.classList.add("gone");
      content?.classList.add("is-error");
      content?.replaceChildren();
      status?.classList.add("is-visible");
      status?.replaceChildren(document.createTextNode("This content is taking longer than expected. Try again later."));
      this.view.closest<HTMLElement>("[aria-busy]")?.setAttribute("aria-busy", "false");
    }, SKELETON_TIMEOUT);
  }

  /** Reveals rendered Markdown into the space reserved by its article skeleton. */
  revealSkeleton(): void {
    this.clearSkeletonTimeout();
    this.view.querySelector<HTMLElement>("[data-markdown-skeleton-content]")?.classList.add("is-ready");
    this.view.querySelector<HTMLElement>("[data-markdown-skeleton]")?.classList.add("gone");
  }

  /**
   * Publishes raw Markdown through `MDService`, causing subscribed views to receive `md:render`.
   *
   * @param markdown - Raw Markdown source to render and publish.
   */
  renderSource(markdown: string): void {
    MDService.render(markdown, {publish: true});
  }

  /**
   * Builds the themed content wrapper used by the Markdown view.
   *
   * @param contentClass - CSS class applied to the generated content wrapper.
   * @returns HTML containing themed existing view content; it does not mutate the DOM.
   */
  renderThemedContent(contentClass: string): string {
    const themeName = this.view.theme ?? portfolioMarkdownTheme.name;
    const colorName = this.view.color ?? portfolioMarkdownColor;
    const theme = THEMES[themeName] ?? portfolioMarkdownTheme;
    const themedContent = this.view.content ? applyMarkdownTheme(this.view.content, theme, colorName) : "";

    return `
      <div class="${contentClass} ${getSelectionClass(theme, colorName)}"
           style="font-family: ${theme.fontFamily},serif">
        ${themedContent}
      </div>
    `;
  }

  /** Wraps themed Markdown in the shared article skeleton and reveal frame. */
  renderArticleSkeleton(contentClass: string): string {
    return `
      <div class="markdown-skeleton-frame" data-markdown-skeleton-frame>
        <div class="markdown-skeleton-layer" data-markdown-skeleton aria-hidden="true">
          <sk-article></sk-article>
        </div>
        <div class="markdown-skeleton-content" data-markdown-skeleton-content>
          ${this.renderThemedContent(contentClass)}
        </div>
        <p class="markdown-skeleton-status" data-markdown-skeleton-status role="status" aria-live="polite">Loading content…</p>
      </div>
    `;
  }

  /** Schedules scrolling to the current URL hash after the next animation frame, replacing any prior request. */
  scheduleHashScroll(): void {
    this.cancelHashScroll();
    const headingId = this.currentHash();
    if (!headingId) {
      return;
    }

    this.hashFrameId = requestAnimationFrame(() => {
      this.hashFrameId = null;
      document.getElementById(headingId)?.scrollIntoView();
    });
  }

  /**
   * Adds `is-revealed` to matching sections immediately when motion is reduced or observers are unavailable;
   * otherwise reveals each section when it intersects the viewport.
   *
   * @param selector - CSS selector for sections inside the Markdown view.
   * @throws DOMException when `selector` is not a valid CSS selector.
   */
  setupReveals(selector: string): void {
    this.observer?.disconnect();
    this.observer = null;

    const sections = [...this.view.querySelectorAll<HTMLElement>(selector)];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-revealed"));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-revealed");
        this.observer?.unobserve(entry.target);
      });
    }, {threshold: 0.08});
    sections.forEach((section) => this.observer?.observe(section));
  }

  /**
   * Adds header-derived `data-label` values to matching body cells for responsive table presentation.
   *
   * @param content - Rendered Markdown container whose tables are decorated in place.
   */
  decorateResponsiveTables(content: HTMLElement): void {
    content.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
      const labels = [...table.querySelectorAll<HTMLTableCellElement>("thead th")]
        .map((cell) => cell.textContent?.trim() ?? "");
      table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
        [...row.cells].forEach((cell, index) => {
          if (labels[index]) {
            cell.dataset.label = labels[index];
          }
        });
      });
    });
  }

  /**
   * Shows a copied-state label and restores the default label after the shared delay.
   *
   * @param element - Label-bearing element whose text content is updated.
   * @param copiedLabel - Temporary label shown immediately.
   * @param defaultLabel - Label restored after the temporary state expires.
   * @param stateClass - Optional class applied while the copied state is visible.
   */
  markCopied(element: HTMLElement, copiedLabel: string, defaultLabel: string, stateClass = ""): void {
    element.textContent = copiedLabel;
    if (stateClass) {
      element.classList.add(stateClass);
    }
    const previousTimer = this.copyResetTimers.get(element);
    if (previousTimer !== undefined) {
      window.clearTimeout(previousTimer);
    }

    const timer = window.setTimeout(() => {
      this.copyResetTimers.delete(element);
      element.textContent = defaultLabel;
      if (stateClass) {
        element.classList.remove(stateClass);
      }
    }, COPY_RESET_DELAY);
    this.copyResetTimers.set(element, timer);
  }

  /** Cancels pending reveal, copy-label, and hash-scroll work owned by this helper. */
  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.copyResetTimers.forEach((timer) => window.clearTimeout(timer));
    this.copyResetTimers.clear();
    this.cancelHashScroll();
    this.clearSkeletonTimeout();
  }

  private cancelHashScroll(): void {
    if (this.hashFrameId !== null) {
      cancelAnimationFrame(this.hashFrameId);
      this.hashFrameId = null;
    }
  }

  private clearSkeletonTimeout(): void {
    if (this.skeletonTimeoutId !== null) {
      window.clearTimeout(this.skeletonTimeoutId);
      this.skeletonTimeoutId = null;
    }
  }

  private currentHash(): string {
    const hash = window.location.hash.slice(HASH_PREFIX_LENGTH);
    try {
      return decodeURIComponent(hash);
    } catch {
      return "";
    }
  }
}

/** Defers source publication until a newly-rendered Markdown child is connected. */
export class MarkdownSourceLifecycle {
  private frameId: number | null = null;

  /**
   * Creates a source scheduler scoped to the supplied host element.
   *
   * @param host - Element that must remain connected before publication is allowed.
   */
  constructor(private readonly host: HTMLElement) {}

  /**
   * Schedules `publish` for the next animation frame if the host is still connected.
   *
   * @param publish - Callback that publishes the source to the Markdown view.
   */
  schedule(publish: () => void): void {
    this.cancel();
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      if (this.host.isConnected) {
        publish();
      }
    });
  }

  /** Cancels the pending source-publication frame, if any. */
  disconnect(): void {
    this.cancel();
  }

  private cancel(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}

/** Shared, frame-coalesced progress-bar behavior for Markdown article hosts. */
export class MarkdownProgressLifecycle {
  private frameId: number | null = null;

  /**
   * Creates progress scheduling helpers scoped to the supplied article host.
   *
   * @param host - Article host containing the progress element and rendered sections.
   */
  constructor(private readonly host: HTMLElement) {}

  /**
   * Schedules a document-level scroll-progress update for the next animation frame.
   * The matching element's horizontal scale is clamped to the range `0` to `1`.
   *
   * @param progressSelector - CSS selector for the progress element inside the host.
   */
  scheduleDocumentProgress(progressSelector: string): void {
    this.schedule(progressSelector, () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable <= 0 ? 1 : window.scrollY / scrollable;
    });
  }

  /**
   * Schedules progress based on the first and last section represented by the supplied IDs.
   * The matching element's horizontal scale is clamped to the range `0` to `1`.
   *
   * @param progressSelector - CSS selector for the progress element inside the host.
   * @param sections - Ordered section records whose `id` values identify rendered sections.
   * @param sectionPrefix - ID prefix prepended to each section ID in the host DOM.
   */
  scheduleSectionProgress(
    progressSelector: string,
    sections: readonly {id: string}[],
    sectionPrefix: string,
  ): void {
    this.schedule(progressSelector, () => {
      const firstSection = sections[0];
      const lastSection = sections.at(-1);
      const first = firstSection
        ? this.host.querySelector<HTMLElement>(`#${sectionPrefix}${firstSection.id}`)
        : null;
      const last = lastSection
        ? this.host.querySelector<HTMLElement>(`#${sectionPrefix}${lastSection.id}`)
        : null;
      if (!first || !last) {
        return null;
      }

      const start = first.getBoundingClientRect().top + window.scrollY;
      const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      return end <= start ? 1 : (window.scrollY - start) / (end - start);
    });
  }

  /** Cancels the pending progress frame, if any. */
  disconnect(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private schedule(progressSelector: string, calculateProgress: () => number | null): void {
    if (this.frameId !== null) {
      return;
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      const progressBar = this.host.querySelector<HTMLElement>(progressSelector);
      const progress = calculateProgress();
      if (!progressBar || progress === null) {
        return;
      }

      progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    });
  }
}
