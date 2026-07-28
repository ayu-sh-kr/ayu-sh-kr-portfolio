import {ApplicationEventService, BaseElement, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {formatBlogDate, labelForCategory, type BlogCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {blogIndexContent} from "@app/data/blog-content.ts";
import {BLOG_FILTER_CHANGE_EVENT, BLOG_INDEX_DATA_EVENT, type BlogFilterChange, type BlogIndexData} from "@app/events/blog.events.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {BlogRevealLifecycle} from "@app/utils/blog-reveal-lifecycle.utils.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

/** Renders one non-featured post row with authored text escaped for HTML safety. */
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
  private catalogReady = false;
  private skeletonVisible = true;
  private skeletonTimeoutId: number | null = null;

  constructor() {
    super();
  }

  /** Starts reveal observation for rows inserted by the first catalog event. */
  @OnEvent("connected", true)
  initializeReveal(): void {
    this.revealLifecycle.connect();
    this.skeletonTimeoutId = window.setTimeout(() => {
      this.skeletonTimeoutId = null;
      if (this.catalogReady) {
        return;
      }
      this.catalogReady = true;
      this.updateHTML();
      this.querySelector<HTMLElement>("[data-blog-list-skeleton]")?.classList.add("gone");
      this.skeletonVisible = false;
      this.setAttribute("aria-busy", "false");
    }, 9000);
  }

  /** Releases the row observer when the archive leaves the document. */
  @OnEvent("disconnected", true)
  cleanupReveal(): void {
    this.revealLifecycle.disconnect();
    if (this.skeletonTimeoutId !== null) {
      window.clearTimeout(this.skeletonTimeoutId);
      this.skeletonTimeoutId = null;
    }
  }

  /** Stores the authored catalog and renders its non-featured rows. */
  @OnEvent(BLOG_INDEX_DATA_EVENT)
  receiveBlogData(event: ApplicationEvent<typeof BLOG_INDEX_DATA_EVENT>): void {
    this.posts = event.data.posts;
    const shouldRevealSkeleton = !this.catalogReady;
    this.catalogReady = true;
    if (this.skeletonTimeoutId !== null) {
      window.clearTimeout(this.skeletonTimeoutId);
    }
    this.skeletonTimeoutId = null;
    this.updateHTML();
    this.revealLifecycle.refresh();
    if (shouldRevealSkeleton) {
      requestAnimationFrame(() => {
        this.skeletonVisible = false;
        this.querySelector<HTMLElement>("[data-blog-list-skeleton]")?.classList.add("gone");
        this.setAttribute("aria-busy", "false");
      });
    }
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

  /** Renders loading, filtered rows, or the empty state from local event data. */
  render(): string {
    const content = !this.catalogReady
      ? `<p class="blog-loading">${blogIndexContent.list.loading}</p>`
      : !this.posts.length
        ? `<p class="blog-load-error" role="alert">Couldn’t load posts right now. Try refreshing.</p>`
        : (() => {
          const featured = this.posts.find((post) => post.featured) ?? this.posts[0];
          const rows = this.posts.filter((post) => {
            const isNotFeatured = post.slug !== featured.slug;
            const matchesFilter = this.currentFilter === "all" || post.category === this.currentFilter;
            return isNotFeatured && matchesFilter;
          });
          const hasVisibleFeatured = this.currentFilter === "all" || featured.category === this.currentFilter;

          return `
            <div class="blog-list">${rows.map(renderPostRow).join("")}</div>
            ${rows.length || hasVisibleFeatured ? "" : `<p class="blog-empty">${blogIndexContent.list.emptyPrefix} ${this.currentFilter} ${blogIndexContent.list.emptySuffix} <button type="button" data-blog-filter-reset>${blogIndexContent.list.resetLabel}</button></p>`}
          `;
        })();

    return `
      <section class="blog-container blog-list-section" aria-label="${blogIndexContent.list.ariaLabel}" aria-busy="${!this.catalogReady}">
        <div class="blog-list-skeleton-frame">
          <div class="blog-list-skeleton-layer ${this.skeletonVisible ? "" : "gone"}" data-blog-list-skeleton aria-hidden="true">
            <sk-list rows="4"></sk-list>
          </div>
          <div class="blog-list-real-layer ${this.catalogReady ? "is-ready" : ""}">${content}</div>
        </div>
      </section>
    `;
  }
}
