import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";

/** Renders the article-shaped placeholder used by slow Markdown views. */
@Component({
  selector: "sk-article",
  shadow: false,
})
export class SkeletonArticleComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Mirrors the category row, wrapping heading, opening prose, and first block. */
  render(): string {
    return `
      <div class="sk-article sk-stagger">
        <div class="sk-article-chip-row">
          <span class="sk sk-chip"></span>
          <span class="sk sk-chip sk-article-read-chip"></span>
        </div>
        <span class="sk sk-title sk-article-title-primary"></span>
        <span class="sk sk-title sk-article-title-secondary"></span>
        <span class="sk sk-line sk-article-line sk-article-line-full"></span>
        <span class="sk sk-line sk-article-line sk-article-line-wide"></span>
        <span class="sk sk-line sk-article-line sk-article-line-near-full"></span>
        <span class="sk sk-line sk-article-line sk-article-line-short"></span>
        <span class="sk sk-block sk-article-block"></span>
      </div>
    `;
  }
}
