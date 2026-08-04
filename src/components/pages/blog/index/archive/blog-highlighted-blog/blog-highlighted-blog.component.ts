import {BaseElement, BindEvent, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {formatBlogDate, getLatestBlogPost, labelForCategory, type BlogCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {blogIndexContent} from "@app/data/blog-content.ts";
import {BLOG_FILTER_CHANGE_EVENT, BLOG_INDEX_DATA_EVENT} from "@app/events/blog.events.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {BlogRevealLifecycle} from "@app/utils/blog-reveal-lifecycle.utils.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

/**
 * Displays the newest configured post and hides it when its category is filtered out.
 *
 * It listens to catalog and filter events rather than receiving props from the
 * list shell. The shared reveal lifecycle handles the one card's entrance state.
 *
 * Selector: `blog-highlighted-blog`.
 */
@Component({
  selector: "blog-highlighted-blog",
  shadow: false,
})
export class BlogHighlightedBlogComponent extends BaseElement {
  private readonly revealLifecycle = new BlogRevealLifecycle(this);
  private highlightedPost: BlogPost | null = null;
  private currentFilter: BlogCategory | "all" = "all";

  constructor() {
    super();
  }

  /** Starts observation for the highlighted card after its host markup is initialized. */
  @OnEvent("connected", true)
  initializeReveal(): void {
    this.revealLifecycle.connect();
  }

  /** Releases the shared observer when the card leaves the page. */
  @OnEvent("disconnected", true)
  cleanupReveal(): void {
    this.revealLifecycle.disconnect();
  }

  /** Stores the newest configured post from the catalog and rebuilds this section. */
  @OnEvent(BLOG_INDEX_DATA_EVENT)
  receiveBlogData(event: ApplicationEvent<typeof BLOG_INDEX_DATA_EVENT>): void {
    this.highlightedPost = getLatestBlogPost(event.data.posts) ?? null;
    this.updateHTML();
    this.revealLifecycle.refresh();
  }

  /** Stores the selected category and re-renders visibility without reaching into the list. */
  @OnEvent(BLOG_FILTER_CHANGE_EVENT)
  receiveFilterChange(event: ApplicationEvent<typeof BLOG_FILTER_CHANGE_EVENT>): void {
    this.currentFilter = event.data.filter;
    this.updateHTML();
    this.revealLifecycle.refresh();
  }

  /** Records the highlighted article opened from the top of the blog index. */
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

  /** Renders the highlighted card only when catalog data exists and matches the active filter. */
  render(): string {
    if (!this.highlightedPost) {
      return "";
    }

    const isVisible = this.currentFilter === "all" || this.highlightedPost.category === this.currentFilter;
    return `
      <section class="blog-container blog-featured-section" aria-label="${blogIndexContent.highlighted.ariaLabel}"${isVisible ? "" : " hidden"}>
        <a class="blog-featured blog-reveal" data-blog-reveal data-analytics-project="blog" data-analytics-slug="${this.highlightedPost.slug}" data-blog-category="${this.highlightedPost.category}"
           href="/blog/${this.highlightedPost.slug}">
          <div class="blog-meta-row"><span class="blog-chip">${labelForCategory(this.highlightedPost.category)}</span><span>${this.highlightedPost.minutes} ${blogIndexContent.readTimeSuffix}</span></div>
          <h2>${escapeHtml(this.highlightedPost.header)}</h2>
          <p>${escapeHtml(this.highlightedPost.description)}</p>
          <div class="blog-featured-footer"><time datetime="${this.highlightedPost.date}">${formatBlogDate(this.highlightedPost.date)}</time><span class="blog-read-link">${blogIndexContent.highlighted.readLabel} <span class="blog-arrow" aria-hidden="true">→</span></span></div>
        </a>
      </section>
    `;
  }
}
