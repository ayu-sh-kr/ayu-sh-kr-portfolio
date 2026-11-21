import { archivePageSize, archiveSlice } from "@app/utils/archive-page.utils.ts";

export type PagerVariant = "index-lens" | "date-reel" | "story-stack";
export type ArchiveEntry = { date: string; title: string };

export interface PageSummary {
  dates: string;
  headlines: readonly string[];
  count: number;
  first: number;
  last: number;
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});

/** Use the same chronological slice for the archive, gesture preview and jump dialog. */
export function summarizePage(entries: readonly ArchiveEntry[], page: number): PageSummary {
  const slice = archiveSlice(entries, page);
  const dates = slice.length ? dateFormat.formatRange(
    new Date(slice[slice.length - 1].date), new Date(slice[0].date),
  ) : "";
  const offset = (page - 1) * archivePageSize;
  return {
    dates, count: slice.length, first: offset + 1, last: offset + slice.length,
    headlines: slice.slice(0, 2).map(entry => entry.title)
  };
}

export const bound = (n: number, low: number, high: number) => Math.max(low, Math.min(n, high));
export function windowStart(center: number, slots: number, total: number) {
  return bound(Math.round(center) - Math.floor(slots / 2), 1, total - slots + 1);
}

export interface VisualContext {
  current: number;
  total: number;
  slots: number;
  width: number;
  left: number;
  summarize(page: number): PageSummary;
}

/** One transient surface per interaction. Position is continuous; depth returns to zero on settling. */
export interface VisualFrame {
  position: number;
  depth: number;
}
export interface MountedVisual {
  update(frame: VisualFrame): void;
  dispose(): void;
}

/** Static links → mount on intent → update while tracking/settling → dispose on commit, cancel or disconnect.
 * Only the host navigates. Visuals own transient DOM inside their surface and never alter canonical links.
 */
export interface PagerVisual {
  id: PagerVariant;
  slots: 3 | 5;
  caption?(summary: PageSummary): string;
  position(context: VisualContext, startX: number, x: number): number;
  mount(surface: HTMLElement, context: VisualContext): MountedVisual;
}
