import {BaseElement, BindEvent, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {getArticleShareData, getArticleShareUrl, type SharePlatform} from "./article-share.utils.ts";

/**
 * End-of-article sharing block used by blog and Dispatch pages. Route owners supply
 * article metadata through attributes; this element owns native sharing, references,
 * clipboard feedback, and platform URLs without reading either article catalog.
 * Inline icons keep controls available without external icon requests.
 * Selector: `article-share`.
 */
@Component({selector: "article-share", shadow: false})
export class ArticleShareComponent extends BaseElement {
  /** Attribute `article-title`; defaults to empty and supplies share text and references. */
  @Property({name: "article-title", type: String})
  articleTitle = "";
  /** Attribute `canonical-url`; required HTTP(S) URL; queries and hashes are removed. */
  @Property({name: "canonical-url", type: String})
  canonicalUrl = "";
  /** Attribute `author`; optional reference author; defaults to empty. */
  @Property({name: "author", type: String})
  author = "";
  /** Attribute `publication-date`; optional authored date for references; defaults to empty. */
  @Property({name: "publication-date", type: String})
  publicationDate = "";

  /**
   * Shares the catalog's clean permalink or copies a title/author reference.
   * Native sharing falls back to copying when unavailable or unsuccessful;
   * cancellation is silent. Clipboard failures reveal selectable text instead.
   * Feedback changes only the share region, preserving the loaded Markdown.
   */
  @BindEvent({event: "click", id: "[data-share-action]"})
  async shareArticle(event: Event): Promise<void> {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-share-action]");
    const data = getArticleShareData({title: this.articleTitle, url: this.canonicalUrl, author: this.author, date: this.publicationDate});
    if (!button || !data || button.disabled) {
      return;
    }
    const action = button.dataset.shareAction;
    const status = this.querySelector<HTMLElement>("[data-share-status]");
    const fallback = this.querySelector<HTMLTextAreaElement>("[data-share-fallback]");
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

  /** Renders clean platform URLs and accessible icon controls; invalid URLs hide the block. */
  render(): string {
    const data = getArticleShareData({title: this.articleTitle, url: this.canonicalUrl, author: this.author, date: this.publicationDate});
    if (!data) {
      return "";
    }
    const icon = (name: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
    const button = (action: string, name: string, label: string) => `<button class="article-share-button ${action === "native" ? "article-share-button--primary" : ""}" type="button" data-share-action="${action}" aria-label="${label}" title="${label}">${icon(name)}<span class="article-share-tooltip" aria-hidden="true">${label}</span></button>`;
    const platform = (name: SharePlatform, label: string) => `<a class="article-share-button" href="${escapeHtml(getArticleShareUrl(name, data))}" target="_blank" rel="noopener noreferrer" aria-label="Share on ${label} (opens in a new tab)" title="Share on ${label}">${icon(name)}<span class="article-share-tooltip" aria-hidden="true">${label}</span></a>`;
    return `
      <section class="article-share-block" aria-label="Share this article">
        <div class="article-share-heading"><span class="article-share-eyebrow">PASS IT ON</span><h2>Share this article</h2></div>
        <div class="article-share-actions">
          ${button("native", "share", "Share article")}
          ${platform("linkedin", "LinkedIn")}${platform("whatsapp", "WhatsApp")}${platform("x", "X")}
          ${button("link", "link", "Copy link")}${button("reference", "reference", "Copy reference")}
        </div>
        <p class="article-share-status" data-share-status role="status" aria-live="polite"></p>
        <textarea class="article-share-fallback" data-share-fallback aria-label="Article sharing text" readonly hidden></textarea>
      </section>`;
  }
}

/** Local SVG paths for the share actions; no network-loaded icon dependency. */
const icons: Record<string, string> = {
  "share": "<circle cx=\"18\" cy=\"5\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"19\" r=\"3\"/><path d=\"m8.6 10.5 6.8-4M8.6 13.5l6.8 4\"/>",
  "linkedin": "<path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v2a4 4 0 0 1 2-3Z\"/><rect x=\"2\" y=\"9\" width=\"4\" height=\"12\"/><circle cx=\"4\" cy=\"4\" r=\"2\"/>",
  "whatsapp": "<path d=\"M20.5 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z\"/><path d=\"m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 2c-1 3-4 2-7-1s-5-6-2-8Z\"/>",
  "x": "<path d=\"m4 4 16 16M20 4 4 20M4 4h4l12 16h-4L4 4Z\"/>",
  "link": "<path d=\"m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0\" transform=\"translate(1 0) scale(.9)\"/>",
  "reference": "<rect x=\"8\" y=\"7\" width=\"12\" height=\"14\" rx=\"2\"/><path d=\"M15 7V3H4v14h4M11 11h6M11 15h6\"/>"
};
