import {ApplicationEventService, BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {blogPosts, getBlogPost, getBlogSlug, type BlogPost} from "@app/configs/blogs.config.ts";
import {
  BLOG_ARTICLE_DATA_EVENT,
  BLOG_ARTICLE_ERROR_EVENT,
  BLOG_INDEX_DATA_EVENT,
  BLOG_MARKDOWN_SOURCE_EVENT,
  type BlogArticleData,
  type BlogArticleError,
  type BlogIndexData,
  type BlogMarkdownSource,
} from "@app/events/blog.events.ts";

/**
 * Selects the blog index or article view and publishes the data each child needs.
 *
 * Used by both `/blog` and `/blog/:slug` pages. After the host has initialized,
 * it derives the current slug, publishes either index data or article metadata,
 * and fetches Markdown for a valid article. The request is aborted when the
 * component disconnects, so a late response cannot outlive the page instance.
 *
 * Selector: `blog-view`.
 */
@Component({
  selector: "blog-view",
  shadow: false,
})
export class BlogViewComponent extends BaseElement {
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private articleRequest: AbortController | null = null;

  constructor() {
    super();
  }

  /**
   * Publishes route-specific blog data after child event listeners are initialized.
   * Index routes publish {@link BLOG_INDEX_DATA_EVENT}; article routes publish
   * {@link BLOG_ARTICLE_DATA_EVENT} and start Markdown loading for valid posts.
   */
  @OnEvent("connected", true)
  initializeBlogView(): void {
    const slug = getBlogSlug(window.location.pathname);
    if (!slug) {
      void this.publisher.publishAsync({
        name: BLOG_INDEX_DATA_EVENT,
        data: {posts: blogPosts} satisfies BlogIndexData,
      });
      return;
    }

    const post = getBlogPost(slug) ?? null;
    const nextPost = post && blogPosts.length > 1
      ? blogPosts[(blogPosts.indexOf(post) + 1) % blogPosts.length] ?? null
      : null;

    void this.publisher.publishAsync({
      name: BLOG_ARTICLE_DATA_EVENT,
      data: {
        post,
        nextPost,
      } satisfies BlogArticleData,
    });
    if (post) {
      void this.loadArticle(post);
    }
  }

  /**
   * Aborts and clears the active article request when the blog view leaves the
   * document, preventing a late response from publishing into a new route.
   */
  @OnEvent("disconnected", true)
  cleanupArticleRequest(): void {
    this.articleRequest?.abort();
    this.articleRequest = null;
  }

  /**
   * Fetches the selected post's Markdown and publishes {@link BLOG_MARKDOWN_SOURCE_EVENT}
   * for `blog-markdown-view`; failures become {@link BLOG_ARTICLE_ERROR_EVENT}.
   * The controller identity prevents an older request from publishing after a
   * reconnect or another article load has replaced it.
   */
  private async loadArticle(post: BlogPost): Promise<void> {
    this.articleRequest?.abort();
    const request = new AbortController();
    this.articleRequest = request;

    try {
      const response = await fetch(encodeURI(post.source), {
        signal: request.signal,
        headers: {Accept: "text/markdown,text/plain;q=0.9"},
      });
      if (!response.ok) {
        throw new Error(`Unable to load ${post.source} (${response.status})`);
      }
      const markdown = await response.text();
      if (this.articleRequest !== request) {
        return;
      }
      void this.publisher.publishAsync({
        name: BLOG_MARKDOWN_SOURCE_EVENT,
        data: {markdown} satisfies BlogMarkdownSource,
      });
    } catch (error) {
      if (request.signal.aborted || this.articleRequest !== request) {
        return;
      }
      void this.publisher.publishAsync({
        name: BLOG_ARTICLE_ERROR_EVENT,
        data: {message: "This post could not be loaded right now."} satisfies BlogArticleError,
      });
    }
  }

  /** Chooses the index or article child from the current URL without performing I/O. */
  render(): string {
    return getBlogSlug(window.location.pathname)
      ? "<blog-article></blog-article>"
      : "<blog-index></blog-index>";
  }
}
