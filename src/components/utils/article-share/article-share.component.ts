import {BaseElement, BindEvent, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {escapeHtml} from "@app/utils/html.utils.ts";
import {getArticleShareData, getArticleShareUrl, type SharePlatform} from "./article-share.utils.ts";

/**
 * End-of-article sharing block used by blog and Dispatch pages. Route owners supply
 * article metadata through attributes; this element owns native sharing, references,
 * clipboard feedback, and platform URLs without reading either article catalog.
 * Icons use the application’s shared `dota-icon` renderer and Iconify identifiers.
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
    const icon = (name: string) => `<dota-icon name="${icons[name]}" size="sm" aria-hidden="true"></dota-icon>`;
    const button = (action: string, name: string, label: string) => `<button class="article-share-button" type="button" data-share-action="${action}" aria-label="${label}" title="${label}">${icon(name)}<span class="article-share-tooltip" aria-hidden="true">${label}</span></button>`;
    const platform = (name: SharePlatform, label: string) => `<a class="article-share-button" href="${escapeHtml(getArticleShareUrl(name, data))}" target="_blank" rel="noopener noreferrer" aria-label="Share on ${label} (opens in a new tab)" title="Share on ${label}">${icon(name)}<span class="article-share-tooltip" aria-hidden="true">${label}</span></a>`;
    return `
      <section class="article-share-block" aria-label="Share this article">
        <p class="article-share-label">Share this article</p>
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

/** Brand icons and matching outline actions rendered by the application icon component. */
const icons: Record<string, string> = {
  share: "lucide:share-2",
  linkedin: "ri:linkedin-fill",
  whatsapp: "ri:whatsapp-fill",
  x: "ri:twitter-x-fill",
  link: "lucide:link",
  reference: "lucide:copy",
};
