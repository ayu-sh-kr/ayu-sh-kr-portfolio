import { BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { supportContent } from "@app/data/support-content.ts";

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
  /** Active filter key; `all` leaves every authored question visible. */
  private activeCategory = "all";

  /** Creates the stateless FAQ component before its accordions are rendered. */
  constructor() {
    super();
  }

  /** Filters the existing accordions as the visitor refines the search term. */
  @BindEvent({ event: "input", id: "#support-faq-search" })
  filterFaqs(): void {
    this.applyFilters();
  }

  /** Clears the search term and restores focus to the search control. */
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

  /** Activates a category button and filters the existing accordion hosts. */
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

  /** Applies the combined text and category criteria without rerendering the accordions. */
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

  /** Escapes dynamic text for use in quoted accordion and data attributes. */
  private escapeAttribute(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  }

  /** Returns Support's authored answers using the same shared accordion contract as Pricing. */
  render(): string {
    const content = supportContent.faq;
    const accordionConfig = JSON.stringify({
      container: "support-faq-accordion-container",
      button: {
        base: "support-faq-accordion-button",
        size: { md: "" },
        color: { gray: { ghost: "support-faq-accordion-button-color" } },
      },
      paragraph: "support-faq-accordion-answer",
    });

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
                    classname="support-faq-accordion"
                    data-support-faq-item
                    data-category="${faq.category}"
                    data-search-text="${this.escapeAttribute(`${faq.question} ${faq.answer}`.replace(/<[^>]*>/g, "").toLocaleLowerCase())}"
                    header="${this.escapeAttribute(faq.question)}"
                    description="${this.escapeAttribute(faq.answer)}"
                    config='${accordionConfig}'
                  ></dota-accordion>
                `,
              )
              .join("")}
          </div>
          <div id="support-faq-empty" class="support-faq-empty" hidden>
            <h3>${content.empty.title}</h3>
            <p>${content.empty.body}</p>
            <a class="support-faq-ask" href="#support">${content.empty.actionLabel}</a>
          </div>
        </div>
      </section>
    `;
  }
}
