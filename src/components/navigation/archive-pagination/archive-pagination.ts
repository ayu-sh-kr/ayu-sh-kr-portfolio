import {html} from "@ayu-sh-kr/dota-wrap/rendering";
import {archivePageCount, archivePagePath} from "@app/utils/archive-page.utils.ts";

/** A three-number window keeps touch targets full size even in a narrow archive column. */
export function renderArchivePagination(section: "blog" | "news", current: number, count: number) {
  const total = archivePageCount(count);
  if (total <= 1) return html``;
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const pages = Array.from({length: Math.min(total, 3)}, (_, index) => start + index);
  return html`
    <nav class="archive-pager" aria-label="Archive pages">
      <span class="archive-pager-status">Page ${current} of ${total}</span>
      <div class="archive-pager-controls">
        ${current > 1
          ? html`<a class="archive-step prev" rel="prev" href="${archivePagePath(section, current - 1)}" aria-label="Previous page"></a>`
          : html`<span class="archive-step prev" aria-hidden="true"></span>`}
        ${pages.map(page => page === current
          ? html`<span class="archive-key" aria-current="page" aria-label="Page ${page}">${page}</span>`
          : html`<a class="archive-key" href="${archivePagePath(section, page)}" aria-label="Page ${page}">${page}</a>`)}
        ${current < total
          ? html`<a class="archive-step next" rel="next" href="${archivePagePath(section, current + 1)}" aria-label="Next page"></a>`
          : html`<span class="archive-step next" aria-hidden="true"></span>`}
      </div>
    </nav>
  `;
}
