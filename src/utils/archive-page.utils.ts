/** The same boundary drives the static routes, page links and visible catalogue slice. */
export const archivePageSize = 10;

export const archivePageCount = (count: number): number => Math.ceil(count / archivePageSize);

/** Page one lives at the original index URL. Only published subsequent pages can own numeric slugs. */
export function archivePageNumber(pathname: string, section: "blog" | "news", count: number): number | undefined {
  const path = pathname.replace(/\/$/, "");
  if (path === `/${section}`) return 1;
  const match = /^\/(blog|news)\/([1-9]\d*)$/.exec(path);
  if (match?.[1] !== section) return undefined;
  const page = Number(match[2]);
  return page >= 2 && page <= archivePageCount(count) ? page : undefined;
}

export const archivePagePath = (section: "blog" | "news", page: number): string =>
  page === 1 ? `/${section}/` : `/${section}/${page}/`;

/** Keeps the latest entry on the first page when it is presented as a separate feature card. */
export const archiveSlice = <T>(items: readonly T[], page: number): readonly T[] =>
  items.slice((page - 1) * archivePageSize, page * archivePageSize);
