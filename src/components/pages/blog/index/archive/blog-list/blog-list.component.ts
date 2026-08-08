import {ApplicationEventService, BaseElement, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {formatBlogDate, getBlogPostsForIndex, getLatestBlogPost, labelForCategory, type BlogCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {blogIndexContent} from "@app/data/blog-content.ts";
import {BLOG_FILTER_CHANGE_EVENT, type BlogFilterChange} from "@app/events/blog.events.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {BlogRevealLifecycle} from "@app/utils/blog-reveal-lifecycle.utils.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

/** Renders one archive post row with authored text escaped for HTML safety. */
const renderPostRow = (post: BlogPost): string => `
  <a class="blog-row blog-reveal" data-blog-reveal data-analytics-project="blog" data-analytics-slug="${post.slug}" href="/blog/${post.slug}">
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
 * It derives rows from the shared authored catalog and reacts to filter events.
 * The component does not query the highlighted card or filter controls; it publishes
 * only the reset action needed by the filter component.
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
  private readonly posts: readonly BlogPost[] = getBlogPostsForIndex();
  private currentFilter: BlogCategory | "all" = "all";

  constructor() {
    super();
  }

  /** Starts reveal observation for the catalog rows rendered with the component. */
  @OnEvent("connected", true)
  initializeReveal(): void {
    this.revealLifecycle.connect();
  }

  /** Releases the row observer when the archive leaves the document. */
  @OnEvent("disconnected", true)
  cleanupReveal(): void {
    this.revealLifecycle.disconnect();
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

  /** Records an article opened from the archive before router navigation begins. */
  @BindEvent({event: "click", id: "[data-analytics-project]"})
  trackProjectOpen(event: Event): void {
    const link = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-analytics-project]");
    const slug = link?.dataset.analyticsSlug;
    if (!slug || link?.dataset.analyticsProject !== "blog") {
      return;
    }

    publishAnalyticsEvent({
      eventName: "project_open",
      params: {kind: "blog", slug, surface: "blog_index"},
    });
  }

  /** Renders the filtered catalog rows and an empty state when no post matches the active category. */
  render(): string {
    const highlightedPost = getLatestBlogPost(this.posts);
    const rows = this.posts.filter((post) => {
      const isNotHighlighted = post.slug !== highlightedPost?.slug;
      const matchesFilter = this.currentFilter === "all" || post.category === this.currentFilter;
      return isNotHighlighted && matchesFilter;
    });
    const hasVisibleHighlightedPost = highlightedPost !== undefined
      && (this.currentFilter === "all" || highlightedPost.category === this.currentFilter);

    return `
      <section class="blog-container blog-list-section" aria-label="${blogIndexContent.list.ariaLabel}" aria-busy="false">
        <div class="blog-list-skeleton-frame">
          <div class="blog-list-real-layer is-ready">
            <div class="blog-list">${rows.map(renderPostRow).join("")}</div>
            ${rows.length || hasVisibleHighlightedPost ? "" : `<p class="blog-empty">${blogIndexContent.list.emptyPrefix} ${this.currentFilter} ${blogIndexContent.list.emptySuffix} <button type="button" data-blog-filter-reset>${blogIndexContent.list.resetLabel}</button></p>`}
          </div>
        </div>
      </section>
    `;
  }
}
