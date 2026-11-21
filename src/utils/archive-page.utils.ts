/** The same boundary drives the static routes, page links and visible catalogue slice. */
export const archivePageSize = 15;

export const archivePageCount = (count: number): number => Math.ceil(count / archivePageSize);

/** Page one lives at the original index URL. Only published subsequent pages can own numeric slugs. */
export function archivePageNumber(pathname: string, count: number): number | undefined {
  const path = pathname.replace(/\/$/, "");
  if (path === "/news") return 1;
  const match = /^\/news\/([1-9]\d*)$/.exec(path);
  if (!match) return undefined;
  const page = Number(match[1]);
  return page >= 2 && page <= archivePageCount(count) ? page : undefined;
}

export const archivePagePath = (page: number): string =>
  page === 1 ? "/news/" : `/news/${page}/`;

/** Returns the chronological slice used by both the Dispatch list and its page previews. */
export const archiveSlice = <T>(items: readonly T[], page: number): readonly T[] =>
  items.slice((page - 1) * archivePageSize, page * archivePageSize);
