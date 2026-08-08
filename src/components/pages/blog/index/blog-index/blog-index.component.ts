import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";

/**
 * Composes the blog index sections in their reading order.
 *
 * Its children read the shared authored catalog directly. This keeps the static
 * HTML and the hydrated component state identical, without depending on a
 * one-time application event that hydration can miss.
 *
 * Selector: `blog-index`.
 */
@Component({
  selector: "blog-index",
  shadow: false,
})
export class BlogIndexComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Returns the three landing sections in their reading order. */
  render(): string {
    return `
      <main class="blog-index">
        <blog-hero data-analytics-section="blog_featured"></blog-hero>
        <blog-list-section data-analytics-section="blog_archive"></blog-list-section>
        <blog-subscription data-analytics-section="blog_subscription"></blog-subscription>
      </main>
    `;
  }
}
