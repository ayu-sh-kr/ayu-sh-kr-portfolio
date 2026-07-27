import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {formatBlogDate, labelForCategory, type BlogCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {blogIndexContent} from "@app/data/blog-content.ts";
import {BLOG_FILTER_CHANGE_EVENT, BLOG_INDEX_DATA_EVENT} from "@app/events/blog.events.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {BlogRevealLifecycle} from "@app/utils/blog-reveal-lifecycle.utils.ts";

/**
 * Displays the catalog's featured post and hides it when its category is filtered out.
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
  private featured: BlogPost | null = null;
  private currentFilter: BlogCategory | "all" = "all";

  constructor() {
    super();
  }

  /** Starts observation for the featured card after its host markup is initialized. */
  @OnEvent("connected", true)
  initializeReveal(): void {
    this.revealLifecycle.connect();
  }

  /** Releases the shared observer when the card leaves the page. */
  @OnEvent("disconnected", true)
  cleanupReveal(): void {
    this.revealLifecycle.disconnect();
  }

  /** Stores the featured post from the catalog and rebuilds this section. */
  @OnEvent(BLOG_INDEX_DATA_EVENT)
  receiveBlogData(event: ApplicationEvent<typeof BLOG_INDEX_DATA_EVENT>): void {
    const posts: readonly BlogPost[] = event.data.posts;
    this.featured = posts.find((post: BlogPost) => post.featured) ?? posts[0] ?? null;
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

  /** Renders the featured card only when catalog data exists and matches the active filter. */
  render(): string {
    if (!this.featured) {
      return "";
    }

    const isVisible = this.currentFilter === "all" || this.featured.category === this.currentFilter;
    return `
      <section class="blog-container blog-featured-section" aria-label="${blogIndexContent.highlighted.ariaLabel}"${isVisible ? "" : " hidden"}>
        <a class="blog-featured blog-reveal" data-blog-reveal data-blog-category="${this.featured.category}"
           href="/blog/${this.featured.slug}">
          <div class="blog-meta-row"><span class="blog-chip">${labelForCategory(this.featured.category)}</span><span>${this.featured.minutes} ${blogIndexContent.readTimeSuffix}</span></div>
          <h2>${escapeHtml(this.featured.header)}</h2>
          <p>${escapeHtml(this.featured.description)}</p>
          <div class="blog-featured-footer"><time datetime="${this.featured.date}">${formatBlogDate(this.featured.date)}</time><span class="blog-read-link">${blogIndexContent.highlighted.readLabel} <span class="blog-arrow" aria-hidden="true">→</span></span></div>
        </a>
      </section>
    `;
  }
}
