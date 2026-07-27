import {ApplicationEventService, BaseElement, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {formatBlogDate, labelForCategory, type BlogCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {blogIndexContent} from "@app/data/blog-content.ts";
import {BLOG_FILTER_CHANGE_EVENT, BLOG_INDEX_DATA_EVENT, type BlogFilterChange, type BlogIndexData} from "@app/events/blog.events.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {BlogRevealLifecycle} from "@app/utils/blog-reveal-lifecycle.utils.ts";

/** Renders one non-featured post row with authored text escaped for HTML safety. */
const renderPostRow = (post: BlogPost): string => `
  <a class="blog-row blog-reveal" data-blog-reveal href="/blog/${post.slug}">
    <time class="blog-row-date" datetime="${post.date}">${formatBlogDate(post.date, true)}</time>
    <span class="blog-row-copy">
      <span class="blog-row-title">${escapeHtml(post.header)}</span>
      <span class="blog-row-description">${escapeHtml(post.description)}</span>
    </span>
    <span class="blog-chip">${labelForCategory(post.category)}</span>
    <span class="blog-arrow" aria-hidden="true">→</span>
  </a>
`;

/**
 * Renders the filtered archive rows and owns the empty-state reset action.
 *
 * Catalog and filter data arrive through application events. The component does
 * not query the highlighted card or filter controls; it derives its own visible
 * rows and publishes only the reset action needed by the filter component.
 *
 * Selector: `blog-list`.
 */
@Component({
  selector: "blog-list",
  shadow: false,
})
export class BlogListComponent extends BaseElement {
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private readonly revealLifecycle = new BlogRevealLifecycle(this);
  private posts: readonly BlogPost[] = [];
  private currentFilter: BlogCategory | "all" = "all";

  constructor() {
    super();
  }

  /** Starts reveal observation for rows inserted by the first catalog event. */
  @OnEvent("connected", true)
  initializeReveal(): void {
    this.revealLifecycle.connect();
  }

  /** Releases the row observer when the archive leaves the document. */
  @OnEvent("disconnected", true)
  cleanupReveal(): void {
    this.revealLifecycle.disconnect();
  }

  /** Stores the authored catalog and renders its non-featured rows. */
  @OnEvent(BLOG_INDEX_DATA_EVENT)
  receiveBlogData(event: ApplicationEvent<typeof BLOG_INDEX_DATA_EVENT>): void {
    this.posts = event.data.posts;
    this.updateHTML();
    this.revealLifecycle.refresh();
  }

  /** Rebuilds visible rows when the filter control publishes a category change. */
  @OnEvent(BLOG_FILTER_CHANGE_EVENT)
  receiveFilterChange(event: ApplicationEvent<typeof BLOG_FILTER_CHANGE_EVENT>): void {
    this.currentFilter = event.data.filter;
    this.updateHTML();
    this.revealLifecycle.refresh();
  }

  /** Publishes `all` when the empty-state action asks the filter sibling to reset. */
  @BindEvent({event: "click", id: "[data-blog-filter-reset]"})
  resetFilter(event: Event): void {
    event.preventDefault();
    void this.publisher.publishAsync({
      name: BLOG_FILTER_CHANGE_EVENT,
      data: {filter: "all"} satisfies BlogFilterChange,
    });
  }

  /** Renders loading, filtered rows, or the empty state from local event data. */
  render(): string {
    if (!this.posts.length) {
      return `<section class="blog-container blog-list-section"><p class="blog-loading">${blogIndexContent.list.loading}</p></section>`;
    }

    const featured = this.posts.find((post) => post.featured) ?? this.posts[0];
    const rows = this.posts.filter((post) => {
      const isNotFeatured = post.slug !== featured.slug;
      const matchesFilter = this.currentFilter === "all" || post.category === this.currentFilter;
      return isNotFeatured && matchesFilter;
    });
    const hasVisibleFeatured = this.currentFilter === "all" || featured.category === this.currentFilter;

    return `
      <section class="blog-container blog-list-section" aria-label="${blogIndexContent.list.ariaLabel}">
        <div class="blog-list">${rows.map(renderPostRow).join("")}</div>
        ${rows.length || hasVisibleFeatured ? "" : `<p class="blog-empty">${blogIndexContent.list.emptyPrefix} ${this.currentFilter} ${blogIndexContent.list.emptySuffix} <button type="button" data-blog-filter-reset>${blogIndexContent.list.resetLabel}</button></p>`}
      </section>
    `;
  }
}
