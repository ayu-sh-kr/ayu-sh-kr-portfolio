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

/** Shared lifecycle helpers for application-owned Markdown viewers. */
export class MarkdownLifecycleUtils {
  private readonly copyResetTimers = new Map<HTMLElement, number>();
  private hashFrameId: number | null = null;
  private observer: IntersectionObserver | null = null;

  constructor(private readonly view: MdViewComponent) {}

  captureInitialContent(): void {
    if (!this.view.content) {
      this.view.content = this.view.innerHTML;
    }
  }

  renderSource(markdown: string): void {
    MDService.render(markdown, {publish: true});
  }

  renderThemedContent(contentClass: string): string {
    const themeName = this.view.getAttribute("theme") ?? portfolioMarkdownTheme.name;
    const colorName = (this.view.getAttribute("color") ?? portfolioMarkdownColor) as ColorName;
    const theme = THEMES[themeName] ?? portfolioMarkdownTheme;
    const themedContent = this.view.content ? applyMarkdownTheme(this.view.content, theme, colorName) : "";

    return `
      <div class="${contentClass} ${getSelectionClass(theme, colorName)}"
           style="font-family: ${theme.fontFamily},serif">
        ${themedContent}
      </div>
    `;
  }

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

  markCopied(element: HTMLElement, copiedLabel: string, defaultLabel: string): void {
    element.textContent = copiedLabel;
    const previousTimer = this.copyResetTimers.get(element);
    if (previousTimer !== undefined) {
      window.clearTimeout(previousTimer);
    }

    const timer = window.setTimeout(() => {
      this.copyResetTimers.delete(element);
      element.textContent = defaultLabel;
    }, COPY_RESET_DELAY);
    this.copyResetTimers.set(element, timer);
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.copyResetTimers.forEach((timer) => window.clearTimeout(timer));
    this.copyResetTimers.clear();
    this.cancelHashScroll();
  }

  private cancelHashScroll(): void {
    if (this.hashFrameId !== null) {
      cancelAnimationFrame(this.hashFrameId);
      this.hashFrameId = null;
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

  constructor(private readonly host: HTMLElement) {}

  schedule(publish: () => void): void {
    this.cancel();
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      if (this.host.isConnected) {
        publish();
      }
    });
  }

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
