import {ApplicationEventService, BaseElement, Component, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {blogPosts, formatBlogDate, getBlogPost, getBlogSlug, labelForCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {blogArticleContent, blogIndexContent} from "@app/data/blog-content.ts";
import {BLOG_MARKDOWN_SOURCE_EVENT, type BlogMarkdownSource} from "@app/events/blog.events.ts";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {MarkdownProgressLifecycle} from "@app/utils/markdown-lifecycle.utils.ts";
import {BlogLoaderService} from "@app/service/blog-loader.service.ts";

/**
 * Owns the `/blog/:slug` article surface from slug resolution through Markdown reading.
 *
 * After connect it resolves the catalog record, renders loading/not-found/article
 * states, and loads the selected Markdown through `BlogLoaderService`. The raw
 * body crosses the component boundary through {@link BLOG_MARKDOWN_SOURCE_EVENT}
 * for `blog-markdown-view`; the child owns Markdown rendering and post-processing.
 * Document progress and request cleanup remain local to this article boundary.
 *
 * Selector: `blog-article`.
 */
@Component({
  selector: "blog-article",
  shadow: false,
})
export class BlogArticleComponent extends BaseElement {
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();
  private readonly loader = new BlogLoaderService();
  private readonly progressLifecycle = new MarkdownProgressLifecycle(this);
  private ready = false;
  private post: BlogPost | null = null;
  private nextPost: BlogPost | null = null;
  private loadError = "";
  private articleRequest: AbortController | null = null;

  constructor() {
    super();
  }

  /** Resolves the route slug, renders article metadata, and starts Markdown loading. */
  @OnEvent("connected", true)
  initializeArticle(): void {
    const post = getBlogPost(getBlogSlug(window.location.pathname)) ?? null;
    this.post = post;
    this.nextPost = post && blogPosts.length > 1
      ? blogPosts[(blogPosts.indexOf(post) + 1) % blogPosts.length] ?? null
      : null;
    this.ready = true;
    this.updateHTML();
    this.scheduleProgressRender();
    if (post) {
      void this.loadArticle(post);
    }
  }

  /** Schedules document progress updates as the article scrolls. */
  @WindowListener({event: "scroll"})
  scheduleProgressRender(): void {
    this.progressLifecycle.scheduleDocumentProgress("[data-blog-progress]");
  }

  /** Aborts Markdown loading and disconnects progress work when the article leaves the document. */
  @OnEvent("disconnected", true)
  cleanupArticle(): void {
    this.articleRequest?.abort();
    this.articleRequest = null;
    this.progressLifecycle.disconnect();
  }

  /** Loads the selected Markdown and publishes it to the connected Markdown child. */
  private async loadArticle(post: BlogPost): Promise<void> {
    this.articleRequest?.abort();
    const request = new AbortController();
    this.articleRequest = request;

    try {
      const markdown = await this.loader.load(post, request.signal);
      if (request.signal.aborted || this.articleRequest !== request) {
        return;
      }
      void this.publisher.publishAsync({
        name: BLOG_MARKDOWN_SOURCE_EVENT,
        data: {markdown} satisfies BlogMarkdownSource,
      });
    } catch {
      if (request.signal.aborted || this.articleRequest !== request) {
        return;
      }
      this.loadError = blogArticleContent.loadError;
      this.updateHTML();
    }
  }

  /**
   * Returns the loading, not-found, error, or article markup for the current state.
   * The Markdown child is rendered only after article metadata is available.
   */
  render() {
    if (!this.ready) {
      return html`${trustedHTML(`<main class="blog-article-shell layout-page layout-section-hero"><p class="blog-loading">${blogArticleContent.loadingPost}</p></main>`)}`;
    }
    if (!this.post) {
      return html`${trustedHTML(`
        <main class="blog-article-shell layout-page layout-section-hero">
          <a class="blog-back-link" href="/blog">← ${blogArticleContent.allPostsLabel}</a>
          <div class="blog-not-found"><p class="blog-eyebrow">${blogArticleContent.notFound.eyebrow}</p><h1>${blogArticleContent.notFound.title}</h1><a class="app-link app-link--button app-link--ink" href="/blog">${blogArticleContent.notFound.browseLabel}</a></div>
        </main>
      `)}`;
    }

    const markdown = this.loadError
      ? `<article class="blog-prose"><p class="blog-load-error">${escapeHtml(this.loadError)} <a href="/blog">${blogArticleContent.returnToPostsLabel}</a>.</p></article>`
      : `<article class="blog-prose" data-blog-markdown aria-busy="true">
           <blog-markdown-view theme="${portfolioMarkdownTheme.name}" color="${portfolioMarkdownColor}">
             <p class="blog-loading">${blogArticleContent.loadingArticle}</p>
           </blog-markdown-view>
         </article>`;
    const nextLink = this.nextPost
      ? `<a href="/blog/${this.nextPost.slug}" class="blog-quiet-card blog-quiet-card-next"><span><small>${blogArticleContent.footer.nextLabel}</small>${escapeHtml(this.nextPost.header)}</span><span>→</span></a>`
      : "";

    return html`${trustedHTML(`
      <div class="blog-progress" data-blog-progress aria-hidden="true"></div>
      <main class="blog-article-shell layout-page layout-section-hero" data-blog-article>
        <a class="blog-back-link" href="/blog">← ${blogArticleContent.allPostsLabel}</a>
        <blog-article-header
          category="${escapeHtml(labelForCategory(this.post.category))}"
          metadata="${escapeHtml(`${this.post.minutes} ${blogIndexContent.readTimeSuffix} · ${formatBlogDate(this.post.date)}`)}"
          title="${escapeHtml(this.post.header)}"
          writer="${escapeHtml(this.post.writer)}">
        </blog-article-header>
        ${markdown}
        <footer class="blog-article-footer">
          <div class="blog-article-footer-meta"><span class="blog-chip">${labelForCategory(this.post.category)}</span><span>${blogArticleContent.footer.shareCopy}</span></div>
          <div class="blog-post-nav">
            <a href="/blog" class="blog-quiet-card"><span>←</span><span><small>${blogArticleContent.footer.backLabel}</small>${blogArticleContent.allPostsLabel}</span></a>
            ${nextLink}
          </div>
        </footer>
      </main>
    `)}`;
  }
}
