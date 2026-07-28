import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Provides the long-form support reference with combined text search and category filters.
 *
 * It owns only the FAQ interaction. The support form remains a separate element, while
 * this component sends visitors back to its `#support` anchor when no authored answer fits.
 *
 * Selector: `support-faq`.
 */
@Component({ selector: "support-faq", shadow: false })
export class SupportFaqComponent extends BaseElement {
  /** Active filter key; `all` leaves every FAQ category eligible. */
  private activeCategory = "all";
  /** Listener lifetime for the rendered search controls. */
  private controller: AbortController | null = null;

  /** Connects the FAQ controls and initializes the count after the markup is ready. */
  @OnEvent("connected", true)
  initializeFaq(): void {
    this.controller = new AbortController();
    const search = this.querySelector<HTMLInputElement>("#support-faq-search");
    const clear = this.querySelector<HTMLButtonElement>("#support-faq-clear");
    const categories = this.querySelectorAll<HTMLButtonElement>(".support-faq-category");
    const signal = this.controller.signal;

    search?.addEventListener("input", () => this.applyFilters(), { signal });
    clear?.addEventListener("click", () => {
      if (!search) return;
      search.value = "";
      search.focus();
      this.applyFilters();
    }, { signal });
    categories.forEach((category) => category.addEventListener("click", () => {
      this.activeCategory = category.dataset.category ?? "all";
      categories.forEach((button) => button.classList.toggle("is-active", button === category));
      this.applyFilters();
    }, { signal }));

    this.applyFilters();
  }

  /** Releases the dynamic control listeners when the route changes. */
  @OnEvent("disconnected", true)
  cleanupFaq(): void {
    this.controller?.abort();
    this.controller = null;
    this.activeCategory = "all";
  }

  /**
   * Applies the current search term and category together, then reports the visible count.
   *
   * The matching term is marked only in summaries. Bodies stay untouched so repeated input
   * cannot compound markup or alter the authored answer HTML.
   */
  private applyFilters(): void {
    const search = this.querySelector<HTMLInputElement>("#support-faq-search");
    const clear = this.querySelector<HTMLButtonElement>("#support-faq-clear");
    const count = this.querySelector<HTMLElement>("#support-faq-count");
    const empty = this.querySelector<HTMLElement>("#support-faq-empty");
    const term = search?.value.trim().toLocaleLowerCase() ?? "";
    let visibleCount = 0;

    this.querySelectorAll<HTMLDetailsElement>(".support-faq-item").forEach((item) => {
      const searchableText = item.dataset.searchText ?? "";
      const matchesCategory = this.activeCategory === "all" || item.dataset.category === this.activeCategory;
      const isVisible = matchesCategory && (!term || searchableText.includes(term));
      item.hidden = !isVisible;
      if (!isVisible) item.open = false;
      if (isVisible) visibleCount += 1;

      const summary = item.querySelector<HTMLElement>("summary");
      const question = item.dataset.question ?? "";
      if (!summary) return;
      summary.innerHTML = term && isVisible
        ? `${question.replace(new RegExp(this.escapeForRegExp(term), "ig"), (match) => `<mark>${match}</mark>`)}<span class="support-plus" aria-hidden="true">+</span>`
        : `${question}<span class="support-plus" aria-hidden="true">+</span>`;
    });

    const total = supportContent.faqs.length;
    if (clear) clear.classList.toggle("is-visible", Boolean(term));
    if (empty) empty.hidden = visibleCount !== 0;
    if (count) count.innerHTML = visibleCount === total ? `<b>${total}</b> questions` : `<b>${visibleCount}</b> of ${total} questions`;
  }

  /** Escapes a visitor's search text before it becomes a case-insensitive highlighting expression. */
  private escapeForRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /** Renders the searchable FAQ source; controls are connected after this initial paint. */
  render(): string {
    const categories = [
      ["all", "Everything"],
      ["help", "Getting help"],
      ["scope", "Scope & retainers"],
      ["dota", "dota libraries"],
      ["billing", "Billing & handover"],
      ["security", "Security & data"],
    ];

    return HTML`
      <section id="faq" class="support-faq" aria-labelledby="support-faq-title">
        <div class="support-faq-heading">
          <p class="support-eyebrow">Questions</p>
          <h2 id="support-faq-title" class="support-section-title">The long answers.</h2>
          <p>Everything clients and library users actually ask, written out once so nobody has to wait on me for it.</p>
        </div>

        <div class="support-faq-search">
          <span aria-hidden="true">⌕</span>
          <input id="support-faq-search" type="search" placeholder="Search: invoice, retainer, staging, NDA…" aria-label="Search questions" autocomplete="off" />
          <button id="support-faq-clear" type="button" aria-label="Clear search">×</button>
        </div>
        <div class="support-faq-categories" role="group" aria-label="Filter by category">
          ${categories.map(([value, label], index) => `<button class="support-faq-category${index === 0 ? " is-active" : ""}" type="button" data-category="${value}">${label}</button>`).join("")}
        </div>
        <p id="support-faq-count" class="support-faq-count" aria-live="polite"></p>

        <div class="support-faq-list">
          ${supportContent.faqs.map((faq) => `
            <details class="support-faq-item" data-category="${faq.category}" data-question="${faq.question}" data-search-text="${`${faq.question} ${faq.answer}`.replace(/<[^>]*>/g, "").toLocaleLowerCase()}">
              <summary>${faq.question}<span class="support-plus" aria-hidden="true">+</span></summary>
              <div class="support-faq-answer"><span>${faq.categoryLabel}</span>${faq.answer}</div>
            </details>`).join("")}
        </div>

        <div id="support-faq-empty" class="support-faq-empty" hidden>
          <h3>Nothing here matches that.</h3>
          <p>Which is a perfectly good reason to ask me directly — I'll answer, then add it to this page.</p>
          <a class="support-faq-ask" href="#support">Ask me instead</a>
        </div>
      </section>
    `;
  }
}
