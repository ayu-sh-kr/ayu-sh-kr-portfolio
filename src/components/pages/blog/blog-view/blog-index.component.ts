import {ApplicationEventService, BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {blogPosts} from "@app/configs/blogs.config.ts";
import {BLOG_INDEX_DATA_EVENT, type BlogIndexData} from "@app/events/blog.events.ts";

/**
 * Composes the blog index sections in their reading order.
 *
 * This shell publishes the authored catalog after its children have registered
 * their listeners. The grouped list section then distributes no props: filter,
 * highlighted-card, and row components receive the catalog through application
 * events and remain independently replaceable.
 *
 * Selector: `blog-index`.
 */
@Component({
  selector: "blog-index",
  shadow: false,
})
export class BlogIndexComponent extends BaseElement {
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  constructor() {
    super();
  }

  /** Publishes the catalog after the composed index children are ready to receive it. */
  @OnEvent("connected", true)
  publishBlogData(): void {
    void this.publisher.publishAsync({
      name: BLOG_INDEX_DATA_EVENT,
      data: {posts: blogPosts} satisfies BlogIndexData,
    });
  }

  /** Returns the three landing sections in their reading order. */
  render(): string {
    return `
      <main class="blog-index">
        <blog-hero></blog-hero>
        <blog-list-section></blog-list-section>
        <blog-subscription></blog-subscription>
      </main>
    `;
  }
}
