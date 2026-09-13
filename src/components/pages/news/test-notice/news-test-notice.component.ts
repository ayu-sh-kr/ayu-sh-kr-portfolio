import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";

/**
 * Identifies the Dispatch routes as temporary test content before a visitor
 * reads either the note index or an individual permalink.
 *
 * Selector: `news-test-notice`.
 */
@Component({selector: "news-test-notice", shadow: false})
export class NewsTestNoticeComponent extends BaseElement {
  render(): string {
    return `
      <aside class="news-test-notice layout-content layout-row layout-row-loose" aria-label="Temporary test content">
        <p class="news-label">Test content</p>
        <p class="news-meta">The Dispatch is a temporary preview. Its entries are illustrative and should not be treated as published project or operational records.</p>
      </aside>
    `;
  }
}
