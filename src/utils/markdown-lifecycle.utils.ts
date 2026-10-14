import type {MdViewComponent} from "@ayu-sh-kr/dota-md";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";

/**
 * Offset used to remove the leading `#` before a URL hash is decoded.
 * Keeping it named avoids scattering the hash format through navigation logic.
 */
const HASH_PREFIX_LENGTH = 1;

/**
 * Duration of the temporary copied state shown by code and anchor controls.
 * The same delay is used for every Markdown surface through `markCopied()`.
 */
const COPY_RESET_DELAY = 1400;

/**
 * Maximum loading interval for the article skeleton before it becomes an error
 * state, preventing a stalled request from shimmering indefinitely.
 */
const SKELETON_TIMEOUT = 9000;

/**
 * Owns the browser-side behavior shared by the app's Markdown host components.
 *
 * The blog, news, showcase, privacy, and terms hosts each render a dota-md
 * `<md-view>` inside an article skeleton and delegate their common work here:
 * preserving fallback content, rendering raw Markdown into the hosted view,
 * revealing skeletons, handling hashes, decorating tables, and cleaning up
 * asynchronous work. `<md-view>` applies the registered portfolio theme itself.
 * The helper is scoped to one host, so observers, timers, and DOM changes
 * cannot leak into another Markdown surface.
 */
export class MarkdownLifecycleUtils {
  private readonly copyResetTimers = new Map<HTMLElement, number>();
  private hashFrameId: number | null = null;
  private observer: IntersectionObserver | null = null;
  private skeletonTimeoutId: number | null = null;
  /** Authored loading markup shown inside `<md-view>` until Markdown arrives. */
  private fallback = "";

  /**
   * Creates lifecycle helpers for the supplied Markdown host.
   *
   * @param view - Host element that renders the article skeleton and `<md-view>`.
   */
  constructor(private readonly view: HTMLElement) {}

  /**
   * Preserves authored fallback markup before the host renders its skeleton.
   *
   * Hosts call this from `@BeforeInit()`. The captured markup becomes the
   * initial content of the hosted `<md-view>`, keeping an accessible loading
   * message in the real-content layer while the decorative skeleton is visible.
   * A prerendered host already contains `<md-view>`, which adopts its own
   * content, so nothing is captured then.
   */
  captureInitialContent(): void {
    if (!this.fallback && !this.view.querySelector("md-view")) {
      this.fallback = this.view.innerHTML;
    }
  }

  /**
   * Starts or restarts the timeout that bounds an article skeleton's loading state.
   *
   * The Markdown view calls this after its fallback content is captured. If no
   * `md:render` event arrives within nine seconds, the helper removes the
   * decorative layer, clears stale loading markup, exposes a readable status,
   * and marks the nearest loading container as no longer busy. Calling the
   * method again replaces the previous timer, which is useful when a view starts
   * a new loading cycle.
   */
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

  /**
   * Cross-fades rendered Markdown into the space reserved by its skeleton.
   *
   * Hosts call this from their `md-rendered` handler, after `<md-view>` has
   * mounted and themed the new HTML. It cancels the timeout first, then marks
   * the real content ready and lets CSS remove the decorative skeleton layer.
   */
  revealSkeleton(): void {
    this.clearSkeletonTimeout();
    this.view.querySelector<HTMLElement>("[data-markdown-skeleton-content]")?.classList.add("is-ready");
    this.view.querySelector<HTMLElement>("[data-markdown-skeleton]")?.classList.add("gone");
  }

  /**
   * Renders raw Markdown into the hosted `<md-view>` only.
   *
   * The host calls this when its source event arrives. `<md-view>` renders the
   * source without broadcasting `md:render`, so other Markdown surfaces on the
   * page are unaffected, then dispatches `md-rendered` for host post-processing.
   *
   * @param markdown - Raw source returned by the document loader; it is rendered
   *   as Markdown rather than inserted directly into the DOM.
   */
  renderSource(markdown: string): void {
    this.view.querySelector<MdViewComponent>("md-view")?.renderMarkdown(markdown);
  }

  /**
   * Builds the article loading frame around the hosted `<md-view>`.
   *
   * The frame keeps the article skeleton and real content in the same grid cell,
   * so the skeleton reserves the reader measure while Markdown is being fetched
   * or rendered. The skeleton is explicitly hidden from assistive technology;
   * the separate live status announces loading and can expose the timeout state.
   *
   * @param contentClass - Host-specific class for the `<md-view>` content wrapper,
   *   used by the blog, news, showcase, and legal stylesheets.
   * @returns HTML containing the skeleton layer, the themed `<md-view>` with the
   *   captured fallback, and the live loading status.
   */
  renderArticleSkeleton(contentClass: string): string {
    return `
      <div class="markdown-skeleton-frame" data-markdown-skeleton-frame>
        <div class="markdown-skeleton-layer" data-markdown-skeleton aria-hidden="true">
          <sk-article></sk-article>
        </div>
        <div class="markdown-skeleton-content" data-markdown-skeleton-content>
          <md-view theme="${portfolioMarkdownTheme.name}" color="${portfolioMarkdownColor}" content-class="${contentClass}">${this.fallback}</md-view>
        </div>
        <p class="markdown-skeleton-status" data-markdown-skeleton-status role="status" aria-live="polite">Loading content…</p>
      </div>
    `;
  }

  /**
   * Schedules in-page navigation after rendered headings exist in the DOM.
   *
   * Markdown rendering can replace the heading nodes after the browser has
   * already parsed the URL hash. This method waits one animation frame before
   * calling `scrollIntoView`; a newer request cancels the older frame so route
   * changes do not scroll to stale content.
   *
   * The Markdown anchor plugin percent-encodes punctuation into heading IDs, so
   * a heading such as "ERROR: permission denied" gets the literal ID
   * `error%3A-permission-denied`. The raw hash is therefore tried first, then
   * its decoded form for IDs written with plain characters.
   */
  scheduleHashScroll(): void {
    this.cancelHashScroll();
    const rawHash = window.location.hash.slice(HASH_PREFIX_LENGTH);
    const headingId = this.currentHash();
    if (!rawHash && !headingId) {
      return;
    }

    this.hashFrameId = requestAnimationFrame(() => {
      this.hashFrameId = null;
      const target = (rawHash ? document.getElementById(rawHash) : null)
        ?? (headingId ? document.getElementById(headingId) : null);
      target?.scrollIntoView();
    });
  }

  /**
   * Adds reveal classes to Markdown sections as they enter the viewport.
   *
   * Reduced-motion users and browsers without `IntersectionObserver` receive
   * all sections immediately. Otherwise one observer watches the supplied
   * elements, marks each intersecting element once, and unobserves it. Any
   * observer from an earlier render is disconnected before the new section set
   * is registered.
   *
   * @param selector - Valid CSS selector for the revealable sections inside the
   *   scoped Markdown view.
   * @throws DOMException If `selector` is not a valid CSS selector.
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
   * Adds column labels to Markdown table cells for the mobile layout.
   *
   * The responsive table CSS reads `data-label` from each body cell when the
   * table collapses into stacked rows. Labels come only from the rendered
   * `<thead>` cells, and rows without a matching header are left unchanged.
   * The supplied container is mutated in place after Markdown rendering.
   *
   * @param content - Rendered Markdown container whose tables are ready for
   *   post-processing.
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
   * Shows temporary feedback on a copied-code or copied-anchor control.
   *
   * The label is changed immediately and an optional state class is applied for
   * styling. Repeated calls for the same element cancel its prior reset timer,
   * preventing an earlier copy action from restoring stale text. `disconnect()`
   * clears any reset timers that are still pending when the view is removed.
   *
   * @param element - Existing control whose text and temporary state are updated.
   * @param copiedLabel - Feedback text shown while the copy operation is fresh.
   * @param defaultLabel - Text restored after {@link COPY_RESET_DELAY} milliseconds.
   * @param stateClass - Optional class applied until the default label returns.
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

  /**
   * Releases asynchronous work owned by this Markdown view.
   *
   * Concrete views call this from their scoped `disconnected` lifecycle handler.
   * It disconnects the section observer, clears copy-feedback timers, cancels a
   * pending hash-scroll frame, and stops the skeleton timeout so detached views
   * cannot mutate the document later.
   */
  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.copyResetTimers.forEach((timer) => window.clearTimeout(timer));
    this.copyResetTimers.clear();
    this.cancelHashScroll();
    this.clearSkeletonTimeout();
  }

  /**
   * Cancels the queued hash-scroll frame before a new request or disconnect.
   *
   * Keeping the frame ID here makes hash navigation idempotent across repeated
   * Markdown renders: only the latest rendered document is eligible to receive
   * the scroll operation.
   */
  private cancelHashScroll(): void {
    if (this.hashFrameId !== null) {
      cancelAnimationFrame(this.hashFrameId);
      this.hashFrameId = null;
    }
  }

  /**
   * Clears the active skeleton timeout without changing the rendered state.
   *
   * The caller decides whether the skeleton is being revealed or the view is
   * being disconnected; this helper only releases the browser timer.
   */
  private clearSkeletonTimeout(): void {
    if (this.skeletonTimeoutId !== null) {
      window.clearTimeout(this.skeletonTimeoutId);
      this.skeletonTimeoutId = null;
    }
  }

  /**
   * Reads and safely decodes the current URL hash for in-page navigation.
   *
   * A malformed percent-encoded hash is treated as absent instead of allowing
   * navigation setup to throw during a Markdown render.
   *
   * @returns The decoded hash without its leading `#`, or an empty string when
   *   no usable hash is present.
   */
  private currentHash(): string {
    const hash = window.location.hash.slice(HASH_PREFIX_LENGTH);
    try {
      return decodeURIComponent(hash);
    } catch {
      return "";
    }
  }
}

/**
 * Coordinates the parent-to-child Markdown source handoff.
 *
 * Privacy and terms parents rebuild their Markdown child after the document
 * metadata loads. Publishing on the next animation frame gives the new child a
 * chance to connect and subscribe before the source event is sent. The helper
 * is intentionally scoped to the parent host so a detached or replaced child
 * cannot receive a late publication.
 */
export class MarkdownSourceLifecycle {
  private frameId: number | null = null;

  /**
   * Creates a source scheduler scoped to a parent Markdown host.
   *
   * @param host - Parent element that must remain connected before the deferred
   *   source publication is allowed.
   */
  constructor(private readonly host: HTMLElement) {}

  /**
   * Defers source publication until the next animation frame.
   *
   * A newer schedule replaces the previous frame. When the frame runs, the
   * callback is invoked only if the parent host is still connected, which avoids
   * sending source to a view that was replaced by navigation or an error state.
   *
   * @param publish - Callback that publishes the loaded Markdown and any
   *   associated metadata to the newly connected child view.
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

  /**
   * Cancels a deferred source publication during parent teardown.
   *
   * No callback is invoked after this method returns unless a frame has already
   * started executing; the scheduled callback also checks host connectivity.
   */
  disconnect(): void {
    this.cancel();
  }

  /**
   * Clears the pending animation frame used for source publication.
   *
   * This is shared by `schedule()` and `disconnect()` so replacing a request and
   * tearing down the parent use identical cancellation behavior.
   */
  private cancel(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}

/**
 * Updates reading-progress indicators for Markdown article hosts.
 *
 * Blog and showcase articles track the whole document, while privacy and terms
 * track the first and last rendered sections. Both modes use the same helper:
 * scroll or resize handlers request work here, and one animation frame performs
 * the DOM measurement and scale update. This keeps layout work out of the event
 * handlers and gives each parent an explicit disconnect path.
 */
export class MarkdownProgressLifecycle {
  private frameId: number | null = null;

  /**
   * Creates progress scheduling helpers scoped to one article host.
   *
   * @param host - Article host containing the progress element and, for section
   *   progress, the rendered section elements used for measurement.
   */
  constructor(private readonly host: HTMLElement) {}

  /**
   * Schedules progress based on the document's scrollable height.
   *
   * The progress element is updated on the next animation frame and its
   * horizontal scale is clamped between zero and one. Short documents with no
   * scrollable range are treated as complete rather than leaving the indicator
   * at zero.
   *
   * @param progressSelector - Valid selector for the progress element inside the
   *   article host.
   */
  scheduleDocumentProgress(progressSelector: string): void {
    this.schedule(progressSelector, () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable <= 0 ? 1 : window.scrollY / scrollable;
    });
  }

  /**
   * Schedules progress across the first and last rendered Markdown sections.
   *
   * The parent supplies the ordered section model it already uses for its TOC.
   * The helper resolves the first and last corresponding DOM nodes, measures the
   * range in document coordinates, and clamps the resulting scale between zero
   * and one. If either node is not rendered yet, the current indicator is left
   * unchanged so a render can schedule the calculation again.
   *
   * @param progressSelector - Valid selector for the progress element inside the
   *   article host.
   * @param sections - Ordered section records whose `id` values identify the
   *   rendered Markdown sections.
   * @param sectionPrefix - Prefix used to build each section element ID in the
   *   host DOM.
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

  /**
   * Cancels the pending progress frame during article teardown.
   *
   * A later scroll or resize event may schedule a fresh frame after the view is
   * connected again; this method only releases work for the current connection.
   */
  disconnect(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Coalesces one progress calculation into the next animation frame.
   *
   * Multiple scroll and resize events in the same frame share one DOM read and
   * one style write. A `null` calculation means the required rendered sections
   * are not available yet, so the indicator is intentionally left unchanged.
   *
   * @param progressSelector - Selector for the element whose `scaleX` is updated.
   * @param calculateProgress - Callback that returns a raw progress value or
   *   `null` when the current document cannot be measured.
   */
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
