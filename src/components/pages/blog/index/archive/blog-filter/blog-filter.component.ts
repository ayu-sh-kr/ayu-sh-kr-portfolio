import {ApplicationEventService, BaseElement, BindEvent, Component, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {getBlogPostsForIndex, type BlogCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {blogFilters, blogIndexContent} from "@app/data/blog-content.ts";
import {
  BLOG_FILTER_CHANGE_EVENT,
  type BlogFilterChange,
} from "@app/events/blog.events.ts";

/** Reads and validates the current filter hash, falling back to the full catalog. */
const categoryFromHash = (): BlogCategory | "all" => {
  let value = window.location.hash.replace(/^#\/?/, "");
  try {
    value = decodeURIComponent(value);
  } catch {
    return "all";
  }
  return blogFilters.find((filter) => filter.hash === value || filter.value === value)?.value ?? "all";
};

/**
 * Renders category controls and publishes filter changes for the highlighted card
 * and list. It reads the static authored catalog directly to calculate the visible post count.
 *
 * Selector: `blog-filter`.
 */
@Component({
  selector: "blog-filter",
  shadow: false,
})
export class BlogFilterComponent extends BaseElement {
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private readonly posts: readonly BlogPost[] = getBlogPostsForIndex();
  private currentFilter: BlogCategory | "all" = categoryFromHash();

  constructor() {
    super();
  }

  /** Applies filter events published by this control or the list's empty-state reset. */
  @OnEvent(BLOG_FILTER_CHANGE_EVENT)
  receiveFilterChange(event: ApplicationEvent<typeof BLOG_FILTER_CHANGE_EVENT>): void {
    if (this.currentFilter === event.data.filter) {
      return;
    }
    this.currentFilter = event.data.filter;
    const hash = blogFilters.find((filter) => filter.value === this.currentFilter)?.hash ?? "all";
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/${hash}`);
    this.updateHTML();
  }

  /** Restores the filter from browser hash navigation and notifies sibling components. */
  @WindowListener({event: "hashchange"})
  syncFilterWithHash(): void {
    this.publishFilterChange(categoryFromHash());
  }

  /** Updates the hash and publishes a category selected by a user-facing control. */
  @BindEvent({event: "click", id: "[data-blog-filter]"})
  changeFilter(event: Event): void {
    const filter = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-blog-filter]");
    if (!filter) {
      return;
    }

    event.preventDefault();
    const value = filter.dataset.blogFilter as BlogCategory | "all";
    const hash = blogFilters.find((item) => item.value === value)?.hash ?? "all";
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/${hash}`);
    this.publishFilterChange(value);
  }

  /** Updates local state and sends the selected category through the application event bus. */
  private publishFilterChange(filter: BlogCategory | "all"): void {
    this.currentFilter = filter;
    this.updateHTML();
    void this.publisher.publishAsync({
      name: BLOG_FILTER_CHANGE_EVENT,
      data: {filter} satisfies BlogFilterChange,
    });
  }

  /** Renders the pills and count from local state without touching sibling DOM. */
  render(): string {
    const visibleCount = this.posts.filter((post) => this.currentFilter === "all" || post.category === this.currentFilter).length;
    return `
      <div class="blog-filterbar" aria-label="${blogIndexContent.filter.ariaLabel}">
        <div class="blog-container blog-filter-inner">
          <div class="blog-filter-pills">
            ${blogFilters.map((filter) => `
              <button class="blog-pill${this.currentFilter === filter.value ? " is-active" : ""}" type="button"
                      data-blog-filter="${filter.value}" aria-pressed="${this.currentFilter === filter.value}">
                ${filter.label}
              </button>
            `).join("")}
          </div>
          <span class="blog-count">${visibleCount} ${visibleCount === 1 ? blogIndexContent.filter.postLabel : blogIndexContent.filter.postsLabel}</span>
        </div>
      </div>
    `;
  }
}
