import {newsFilters, type NewsNote} from "../../src/configs/news.config.ts";
import {siteIdentity} from "../../src/data/portfolio-content.ts";

const parameters = new Set(["from", "until", "kind", "limit", "offset"]);
const kinds = new Set<string>(newsFilters.map(filter => filter.value));

/** The HTTP handler turns caller input errors into a 400 response. */
export class InvalidDispatchQuery extends Error {}

/** Round-trip the UTC date to reject impossible days that Date.parse normalizes. */
function validDay(value: string) {
  const time = Date.parse(value + "T00:00:00Z");
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(time)
    && new Date(time).toISOString().slice(0, 10) === value;
}

/** Read decimal pagination parameters without accepting fractions or exponent notation. */
function integer(value: string, min: number, max: number, name: string) {
  const number = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(number) || number < min || number > max) {
    throw new InvalidDispatchQuery(`Invalid ${name}. Expected an integer between ${min} and ${max}.`);
  }
  return number;
}

/** First item strictly older than the boundary in a descending date index. */
function firstOlderThan(notes: readonly NewsNote[], boundary: string) {
  let low = 0;
  let high = notes.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (notes[mid].date >= boundary) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
 * Sort the catalog once when the HTTP handler loads. Each kind index shares
 * the original notes and preserves the same newest-first order.
 *
 * Queries include the publication day `from` and exclude `until`, so adjacent
 * digest windows meet without overlap. Supplying only `until` (or no parameters)
 * returns a complete week. Extended queries return pages of 50 by default.
 * Follow nextOffset with the same dates and filters until it is null.
 */
export function createDispatchQuery(catalog: readonly NewsNote[]) {
  const all = [...catalog].sort((a, b) => b.date.localeCompare(a.date));

  const groups = new Map<string, NewsNote[]>();
  for (const note of all) {
    if (!groups.has(note.kind)) groups.set(note.kind, []);
    groups.get(note.kind)!.push(note);
  }

  return (params: URLSearchParams, today: string) => {
    const seen = new Set<string>();
    for (const key of params.keys()) {
      if (!parameters.has(key) || seen.has(key)) {
        throw new InvalidDispatchQuery(`Unexpected or repeated parameter: ${key}`);
      }
      seen.add(key);
    }

    const until = params.get("until") ?? today;
    if (!validDay(until) || until > today || until < "0001-01-01") {
      throw new InvalidDispatchQuery("Invalid until date.");
    }
    const weekStart = new Date(until + "T00:00:00Z");
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);
    const from = params.get("from") ?? weekStart.toISOString().slice(0, 10);
    if (!validDay(from) || from >= until) {
      throw new InvalidDispatchQuery("from must be a UTC date earlier than until.");
    }

    const kind = params.get("kind") ?? "all";
    if (!kinds.has(kind)) {
      throw new InvalidDispatchQuery("Unknown dispatch kind.");
    }

    // Preserve complete weekly digests for existing callers. Extended queries page by default.
    const paged = [...seen].some(key => key !== "until");
    const limit = paged ? integer(params.get("limit") ?? "50", 1, 200, "limit") : Infinity;
    const offset = integer(params.get("offset") ?? "0", 0, Number.MAX_SAFE_INTEGER, "offset");

    const notes = kind === "all" ? all : groups.get(kind) ?? [];
    const start = firstOlderThan(notes, until);
    const end = firstOlderThan(notes, from);
    const total = end - start;

    const pageStart = start + Math.min(offset, total);
    const items = notes
      .slice(pageStart, Math.min(end, pageStart + limit))
      .map(({slug, date, title, summary}) => ({
        slug,
        date,
        title,
        summary,
        url: `https://www.${siteIdentity.domain}/news/${slug}/`,
      }));

    if (!paged) {
      return {from, until, items};
    }

    const nextOffset = offset + items.length < total ? offset + items.length : null;
    return {from, until, items, total, nextOffset};
  };
}
