import {AfterInit, ApplicationEventService, BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
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

  @AfterInit()
  afterViewInit(): void {
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

  disconnectedCallback(): void {
    this.articleRequest?.abort();
    super.disconnectedCallback();
  }

  private async loadArticle(post: BlogPost): Promise<void> {
    try {
      this.articleRequest?.abort();
      this.articleRequest = new AbortController();
      const response = await fetch(encodeURI(post.source), {
        signal: this.articleRequest.signal,
        headers: {Accept: "text/markdown,text/plain;q=0.9"},
      });
      if (!response.ok) {
        throw new Error(`Unable to load ${post.source} (${response.status})`);
      }
      void this.publisher.publishAsync({
        name: BLOG_MARKDOWN_SOURCE_EVENT,
        data: {markdown: await response.text()} satisfies BlogMarkdownSource,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      void this.publisher.publishAsync({
        name: BLOG_ARTICLE_ERROR_EVENT,
        data: {message: "This post could not be loaded right now."} satisfies BlogArticleError,
      });
    }
  }

  render(): string {
    return getBlogSlug(window.location.pathname)
      ? "<blog-article></blog-article>"
      : "<blog-index></blog-index>";
  }
}
