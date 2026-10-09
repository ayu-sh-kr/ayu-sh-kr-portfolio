import {ApplicationEventService, BaseElement, BeforeInit, BindEvent, Component, WindowListener} from "@ayu-sh-kr/dota-wrap/core";
import {html, trustedHTML} from "@ayu-sh-kr/dota-wrap/rendering";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {blogPosts, formatBlogDate, getBlogPost, getBlogSlug, labelForCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {blogArticleContent, blogIndexContent} from "@app/data/blog-content.ts";
import {BLOG_MARKDOWN_SOURCE_EVENT, type BlogMarkdownSource} from "@app/events/blog.events.ts";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {MarkdownProgressLifecycle} from "@app/utils/markdown-lifecycle.utils.ts";
import {BlogLoaderService} from "@app/service/blog-loader.service.ts";
import {blogViewCountService, toBlogViewTrackingFailureReason} from "@app/service/blog-view-count.service.ts";
import {getBlogShareData} from "./blog-share.utils.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

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
  private hasHydratedArticle = false;
  private post: BlogPost | null = null;
  private nextPost: BlogPost | null = null;
  private loadError = "";
  private articleRequest: AbortController | null = null;
  private trackedSlug: string | null = null;

  constructor() {
    super();
  }

  /** Records whether SSG already supplied the rendered article before hydration. */
  @BeforeInit()
  beforeViewInit(): void {
    this.hasHydratedArticle = this.hasAttribute("data-dh-c")
      || this.querySelector("[data-blog-markdown] .blog-markdown-content") !== null;
  }

  /** Resolves the route slug, renders article metadata, and starts Markdown loading. */
  @OnEvent("connected", true)
  initializeArticle(): void {
    const post = getBlogPost(getBlogSlug(window.location.pathname)) ?? null;
    this.post = post;
    this.nextPost = post && blogPosts.length > 1
      ? blogPosts[(blogPosts.indexOf(post) + 1) % blogPosts.length] ?? null
      : null;
    this.scheduleProgressRender();
    if (!post) {
      return;
    }

    this.trackView(post.slug);
    if (this.hasHydratedArticle) {
      return;
    }

    void this.loadArticle(post);
  }

  /** Sends one non-blocking aggregate metric for this mounted article without affecting rendering. */
  private trackView(slug: string): void {
    if (this.trackedSlug === slug) {
      return;
    }

    this.trackedSlug = slug;
    void blogViewCountService.recordView(slug).catch((error: unknown) => {
      publishAnalyticsEvent({
        eventName: "blog_view_tracking_failed",
        params: {reason: toBlogViewTrackingFailureReason(error)},
      });
    });
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
   * Shares the catalog's clean permalink or copies a title/author reference.
   * Native sharing falls back to copying when unavailable or unsuccessful;
   * cancellation is silent. Clipboard failures reveal selectable text instead.
   * Feedback changes only the share region, preserving the loaded Markdown.
   */
  @BindEvent({event: "click", id: "[data-blog-share-action]"})
  async shareArticle(event: Event): Promise<void> {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-blog-share-action]");
    const post = getBlogPost(getBlogSlug(window.location.pathname));
    if (!button || !post || button.disabled) {
      return;
    }
    const data = getBlogShareData(post);
    const action = button.dataset.blogShareAction;
    const status = this.querySelector<HTMLElement>("[data-blog-share-status]");
    const fallback = this.querySelector<HTMLTextAreaElement>("[data-blog-share-fallback]");
    if (!status || !fallback) {
      return;
    }
    status.textContent = "";
    fallback.hidden = true;
    button.disabled = true;
    try {
      if (action === "native" && typeof navigator.share === "function") {
        try {
          await navigator.share({title: data.title, url: data.url});
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }
        }
      }
      const text = action === "reference" ? data.reference : data.url;
      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard unavailable");
        }
        await navigator.clipboard.writeText(text);
        status.textContent = action === "reference" ? "Reference copied." : "Link copied.";
      } catch {
        fallback.value = text;
        fallback.hidden = false;
        fallback.focus();
        fallback.select();
        status.textContent = "Select and copy the text below.";
      }
    } finally {
      button.disabled = false;
    }
  }

  /**
   * Returns the not-found, error, or article markup for the current route.
   * The route slug is available before the connected lifecycle event, allowing
   * the client to hydrate the same article shell that SSG produced.
   */
  render() {
    const post = this.post ?? getBlogPost(getBlogSlug(window.location.pathname)) ?? null;
    if (!post) {
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
    const nextPost = this.nextPost ?? (blogPosts.length > 1
      ? blogPosts[(blogPosts.indexOf(post) + 1) % blogPosts.length] ?? null
      : null);
    const share = getBlogShareData(post);
    const nextLink = nextPost
      ? `<a href="/blog/${nextPost.slug}" class="blog-quiet-card blog-quiet-card-next"><span><small>${blogArticleContent.footer.nextLabel}</small>${escapeHtml(nextPost.header)}</span><span>→</span></a>`
      : "";

    return html`${trustedHTML(`
      <div class="blog-progress" data-blog-progress aria-hidden="true"></div>
      <main class="blog-article-shell layout-page layout-section-hero" data-blog-article>
        <a class="blog-back-link" href="/blog">← ${blogArticleContent.allPostsLabel}</a>
          <blog-article-header
          category="${escapeHtml(labelForCategory(post.category))}"
          metadata="${escapeHtml(`${post.minutes} ${blogIndexContent.readTimeSuffix} · ${formatBlogDate(post.date)}`)}"
          title="${escapeHtml(post.header)}"
          writer="${escapeHtml(post.writer)}">
        </blog-article-header>
        <section class="blog-share" aria-label="Share this article">
          <div class="blog-share-actions">
            <button type="button" data-blog-share-action="native">Share</button>
            <a href="${escapeHtml(share.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="Share this article on LinkedIn (opens in a new tab)">LinkedIn</a>
            <a href="${escapeHtml(share.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="Share this article on WhatsApp (opens in a new tab)">WhatsApp</a>
            <button type="button" data-blog-share-action="link">Copy link</button>
            <button type="button" data-blog-share-action="reference">Copy reference</button>
          </div>
          <p class="blog-share-status" data-blog-share-status role="status" aria-live="polite"></p>
          <textarea class="blog-share-fallback" data-blog-share-fallback aria-label="Article sharing text" readonly hidden></textarea>
        </section>
        ${markdown}
        <blog-subscription data-analytics-section="blog_article_subscription"></blog-subscription>
        <aside class="blog-coffee-support" aria-labelledby="blog-coffee-support-title" data-analytics-section="blog_article_coffee">
          <h2 id="blog-coffee-support-title" class="blog-coffee-support-title">${blogArticleContent.coffeeSupport.title}</h2>
          <p class="blog-coffee-support-copy">${blogArticleContent.coffeeSupport.copy}</p>
          <a class="blog-coffee-support-link" href="/coffee">${blogArticleContent.coffeeSupport.linkLabel} <span aria-hidden="true">→</span></a>
        </aside>
        <footer class="blog-article-footer">
          <div class="blog-article-footer-meta"><span class="blog-chip">${labelForCategory(post.category)}</span><span>${blogArticleContent.footer.shareCopy}</span></div>
          <div class="blog-post-nav">
            <a href="/blog" class="blog-quiet-card"><span>←</span><span><small>${blogArticleContent.footer.backLabel}</small>${blogArticleContent.allPostsLabel}</span></a>
            ${nextLink}
          </div>
        </footer>
      </main>
    `)}`;
  }
}
