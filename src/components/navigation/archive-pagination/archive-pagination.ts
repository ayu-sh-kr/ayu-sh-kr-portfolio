import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { configuredPagerVariant } from "@app/configs/archive-pagination.config.ts";
import { archivePageCount, archivePagePath } from "@app/utils/archive-page.utils.ts";
import { summarizePage, windowStart, type ArchiveEntry, type ArchiveSection } from "./pager-contract.ts";
import { renderPageFinder } from "./page-finder.ts";
import { pagerVisuals } from "./visuals/index.ts";

/** Prerender the same navigable window used by the gesture host. Narrow lens layouts keep three anchors. */
export function renderArchivePagination(section: ArchiveSection, current: number, entries: readonly ArchiveEntry[]) {
  const total = archivePageCount(entries.length);
  if (total <= 1) return html``;
  const design = pagerVisuals[configuredPagerVariant];
  const caption = design.caption?.(summarizePage(entries, current));
  const slots = Math.min(total, design.slots);
  const start = windowStart(current, slots, total);
  const compact = windowStart(current, Math.min(3, slots), total);
  const numbers = Array.from({ length: slots }, (_, index) => start + index);
  return html`
    <nav class="archive-pager" aria-label="Archive pages">
      <archive-swipe data-section="${section}" data-page="${current}" data-total="${total}" data-variant="${design.id}">
        <div class="archive-pager-controls">
          ${current > 1
      ? html`<a class="archive-step prev" rel="prev" href="${archivePagePath(section, current - 1)}" aria-label="Previous page"></a>`
      : html`<span class="archive-step prev" aria-hidden="true"></span>`}
          <div class="pager-stage"><div class="pager-numbers">
            ${numbers.map(page => page === current
        ? html`<span class="archive-key" aria-current="page" aria-label="Page ${page}">${page}</span>`
        : html`<a class="archive-key" data-outer="${page < compact || page >= compact + 3}" href="${archivePagePath(section, page)}" aria-label="Page ${page}">${page}</a>`)}
          </div></div>
          ${current < total
      ? html`<a class="archive-step next" rel="next" href="${archivePagePath(section, current + 1)}" aria-label="Next page"></a>`
      : html`<span class="archive-step next" aria-hidden="true"></span>`}
        </div>
        <div class="pager-caption">
          ${caption ? html`<p class="pager-date">${caption}</p>` : ""}
          <span>Page ${current} of ${total}</span>
        </div>
        ${renderPageFinder(section, current, total)}
      </archive-swipe>
    </nav>`;
}
