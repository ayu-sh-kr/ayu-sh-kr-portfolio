import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {blogIndexContent} from "@app/data/blog-content.ts";

/**
 * Groups the blog index controls and catalog results into one section.
 *
 * The group owns layout and reading order only. `blog-filter`,
 * `blog-highlighted-blog`, and `blog-list` keep their own event subscriptions
 * and rendering responsibilities, so the section does not become a second data
 * coordinator.
 *
 * Selector: `blog-list-section`.
 */
@Component({
  selector: "blog-list-section",
  shadow: false,
})
export class BlogListSectionComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders the filter, highlighted post, and filtered archive as one page section. */
  render(): string {
    return `
      <section class="blog-list-section-shell" aria-label="${blogIndexContent.listSection.ariaLabel}">
        <blog-filter></blog-filter>
        <blog-highlighted-blog></blog-highlighted-blog>
        <blog-list></blog-list>
      </section>
    `;
  }
}
