import {AfterInit, BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {formatBlogDate, labelForCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {
  BLOG_ARTICLE_DATA_EVENT,
  BLOG_ARTICLE_ERROR_EVENT,
} from "@app/events/blog.events.ts";
import {portfolioMarkdownColor, portfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {escapeHtml} from "@app/utils/html.utils.ts";

@Component({
  selector: "blog-article",
  shadow: false,
})
export class BlogArticleComponent extends BaseElement {
  private ready = false;
  private post: BlogPost | null = null;
  private nextPost: BlogPost | null = null;
  private loadError = "";
  private frameId: number | null = null;

  constructor() {
    super();
  }

  @AfterInit()
  afterViewInit(): void {
    window.addEventListener("scroll", this.scheduleProgressRender, {passive: true});
  }

  disconnectedCallback(): void {
    window.removeEventListener("scroll", this.scheduleProgressRender);
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    super.disconnectedCallback();
  }

  @OnEvent(BLOG_ARTICLE_DATA_EVENT)
  onArticleData(event: ApplicationEvent<typeof BLOG_ARTICLE_DATA_EVENT>): void {
    const data = event.data;
    this.ready = true;
    this.post = data.post;
    this.nextPost = data.nextPost;
    this.loadError = "";
    this.updateHTML();
    this.scheduleProgressRender();
  }

  @OnEvent(BLOG_ARTICLE_ERROR_EVENT)
  onArticleError(event: ApplicationEvent<typeof BLOG_ARTICLE_ERROR_EVENT>): void {
    this.loadError = event.data.message;
    this.updateHTML();
  }

  private readonly scheduleProgressRender = (): void => {
    if (this.frameId !== null) {
      return;
    }
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      const progressBar = this.querySelector<HTMLElement>("[data-blog-progress]");
      if (!progressBar) {
        return;
      }
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / scrollable));
      progressBar.style.transform = `scaleX(${progress})`;
    });
  };

  render(): string {
    if (!this.ready) {
      return `<main class="blog-article-shell blog-container"><p class="blog-loading">Loading post…</p></main>`;
    }
    if (!this.post) {
      return `
        <main class="blog-article-shell blog-container">
          <a class="blog-back-link" href="/blog">← All posts</a>
          <div class="blog-not-found"><p class="blog-eyebrow">404</p><h1>That post is not here.</h1><a class="blog-ink-button" href="/blog">Browse the blog</a></div>
        </main>
      `;
    }

    const markdown = this.loadError
      ? `<article class="blog-prose"><p class="blog-load-error">${escapeHtml(this.loadError)} <a href="/blog">Return to all posts</a>.</p></article>`
      : `<article class="blog-prose" data-blog-markdown aria-busy="true">
           <blog-markdown-view theme="${portfolioMarkdownTheme.name}" color="${portfolioMarkdownColor}">
             <p class="blog-loading">Loading the post…</p>
           </blog-markdown-view>
         </article>`;
    const nextLink = this.nextPost
      ? `<a href="/blog/${this.nextPost.slug}" class="blog-quiet-card blog-quiet-card-next"><span><small>Next note</small>${escapeHtml(this.nextPost.header)}</span><span>→</span></a>`
      : "";

    return `
      <div class="blog-progress" data-blog-progress aria-hidden="true"></div>
      <main class="blog-article-shell blog-container" data-blog-article>
        <a class="blog-back-link" href="/blog">← All posts</a>
        <header class="blog-article-header">
          <div class="blog-meta-row blog-article-meta">
            <span class="blog-chip">${labelForCategory(this.post.category)}</span>
            <span>${this.post.minutes} min read · ${formatBlogDate(this.post.date)}</span>
          </div>
          <h1>${escapeHtml(this.post.header)}</h1>
          <p class="blog-article-author">Written by ${escapeHtml(this.post.writer)}</p>
        </header>
        ${markdown}
        <footer class="blog-article-footer">
          <div class="blog-article-footer-meta"><span class="blog-chip">${labelForCategory(this.post.category)}</span><span>Share the useful parts.</span></div>
          <div class="blog-post-nav">
            <a href="/blog" class="blog-quiet-card"><span>←</span><span><small>Back to</small>All posts</span></a>
            ${nextLink}
          </div>
        </footer>
      </main>
    `;
  }
}
