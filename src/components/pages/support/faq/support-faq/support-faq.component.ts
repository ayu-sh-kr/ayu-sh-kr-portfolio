import { BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { DOTA_FAQ_ACCORDION_CLASS, DOTA_FAQ_ACCORDION_CONFIG } from "@app/components/utils/faq/dota-faq-accordion.ts";
import { supportContent } from "@app/data/support-content.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/**
 * Renders the support reference as shared Dota accordions.
 *
 * The component supplies Support's authored questions and answers while
 * `dota-accordion` owns the consistent expansion, keyboard, and motion behavior.
 *
 * Selector: `support-faq`.
 */
@Component({ selector: "support-faq", shadow: false })
export class SupportFaqComponent extends BaseElement {
  /**
   * Stores the selected FAQ category between input events.
   *
   * The initial `all` value matches the first rendered category and is changed
   * only by `selectCategory()`; filtering then combines it with the search term.
   */
  private activeCategory = "all";

  /**
   * Creates the FAQ host before its accordion children are rendered.
   *
   * Filtering state is initialized on the instance because the event handlers
   * update existing accordion hosts instead of rebuilding the section.
   */
  constructor() {
    super();
  }

  /**
   * Reapplies both active filters when the search field changes.
   *
   * The handler delegates DOM visibility and result-count updates to
   * `applyFilters()`, preserving the expansion state owned by each accordion.
   */
  @BindEvent({ event: "input", id: "#support-faq-search" })
  filterFaqs(): void {
    this.applyFilters();
  }

  /**
   * Clears the search input, returns focus to it, and reapplies the category.
   *
   * If the control is not mounted, the event is ignored so a partial render
   * cannot cause a null dereference.
   */
  @BindEvent({ event: "click", id: "#support-faq-clear" })
  clearSearch(): void {
    const search = this.querySelector<HTMLInputElement>("#support-faq-search");
    if (!search) {
      return;
    }

    search.value = "";
    search.focus();
    this.applyFilters();
  }

  /**
   * Changes the active category from the clicked filter button.
   *
   * The selected class is updated across the button group before the existing
   * accordion hosts are filtered, keeping the control state and result list in
   * the same event turn.
   */
  @BindEvent({ event: "click", id: "[data-support-faq-category]" })
  selectCategory(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-support-faq-category]");
    const category = button?.dataset.supportFaqCategory;
    if (!button || !category || category === this.activeCategory) {
      return;
    }

    this.activeCategory = category;
    this.querySelectorAll<HTMLButtonElement>("[data-support-faq-category]").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    this.applyFilters();
  }

  /**
   * Applies the current category and normalized search term to every FAQ host.
   *
   * It updates hidden state, the live result count, clear-button visibility, and
   * the empty message in place; accordions are not rerendered, so open answers
   * stay open while visitors refine their search.
   */
  private applyFilters(): void {
    const search = this.querySelector<HTMLInputElement>("#support-faq-search");
    const clear = this.querySelector<HTMLButtonElement>("#support-faq-clear");
    const count = this.querySelector<HTMLElement>("#support-faq-count");
    const empty = this.querySelector<HTMLElement>("#support-faq-empty");
    const term = search?.value.trim().toLocaleLowerCase() ?? "";
    let visibleCount = 0;

    this.querySelectorAll<HTMLElement>("[data-support-faq-item]").forEach((item) => {
      const matchesCategory = this.activeCategory === "all" || item.dataset.category === this.activeCategory;
      const matchesSearch = !term || (item.dataset.searchText ?? "").includes(term);
      item.hidden = !matchesCategory || !matchesSearch;
      if (!item.hidden) {
        visibleCount += 1;
      }
    });

    if (clear) clear.classList.toggle("is-visible", Boolean(term));
    if (count) count.innerHTML = visibleCount === supportContent.faqs.length
      ? `<b>${visibleCount}</b> ${supportContent.faq.questionLabel}`
      : `<b>${visibleCount}</b> of ${supportContent.faqs.length} ${supportContent.faq.questionLabel}`;
    if (empty) empty.hidden = visibleCount !== 0;
  }

  /**
   * Returns Support's authored answers using the same shared accordion contract as Pricing.
   *
   * Search metadata is escaped before it is placed in quoted attributes; the
   * shared `dota-accordion` element remains responsible for disclosure behavior.
   */
  render(): string {
    const content = supportContent.faq;

    return HTML`
      <section id="faq" class="support-faq layout-page layout-section" aria-labelledby="support-faq-title">
        <div class="support-faq-content">
          <div class="support-faq-heading">
            <p class="support-eyebrow">${content.eyebrow}</p>
            <h2 id="support-faq-title" class="type-section">${content.title}</h2>
            <p>${content.body}</p>
          </div>
          <div class="support-faq-search">
            <span aria-hidden="true">⌕</span>
            <input id="support-faq-search" type="search" placeholder="${content.searchPlaceholder}" aria-label="${content.searchAriaLabel}" autocomplete="off" />
            <button id="support-faq-clear" type="button" aria-label="${content.clearAriaLabel}">×</button>
          </div>
          <div class="support-faq-categories layout-row layout-row-tight" role="group" aria-label="${content.categoryAriaLabel}">
            ${content.categories.map((category, index) => `<button class="support-faq-category${index === 0 ? " is-active" : ""}" type="button" data-support-faq-category="${category.value}">${category.label}</button>`).join("")}
          </div>
          <p id="support-faq-count" class="support-faq-count" aria-live="polite"><b>${supportContent.faqs.length}</b> ${content.questionLabel}</p>
          <div class="support-faq-list">
            ${supportContent.faqs
              .map(
                (faq) => HTML`
                  <dota-accordion
                    classname="${DOTA_FAQ_ACCORDION_CLASS}"
                    data-support-faq-item
                    data-category="${faq.category}"
                    data-search-text="${escapeHtml(`${faq.question} ${faq.answer}`.replace(/<[^>]*>/g, "").toLocaleLowerCase())}"
                    header="${escapeHtml(faq.question)}"
                    description="${escapeHtml(faq.answer)}"
                    config='${DOTA_FAQ_ACCORDION_CONFIG}'
                  ></dota-accordion>
                `,
              )
              .join("")}
          </div>
          <div id="support-faq-empty" class="support-faq-empty" hidden>
            <h3>${content.empty.title}</h3>
            <p>${content.empty.body}</p>
            <a class="app-link app-link--button app-link--ink" href="#support">${content.empty.actionLabel}</a>
          </div>
        </div>
      </section>
    `;
  }
}
