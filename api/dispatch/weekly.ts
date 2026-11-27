import type { IncomingMessage, ServerResponse } from "node:http";
import { getNewsNotes } from "../../src/configs/news.config.ts";
import { siteIdentity } from "../../src/data/portfolio-content.ts";

/** Returns seven complete UTC publication dates. Pin "until" to the scheduled
 * run date when retrying a digest. The upper boundary is exclusive so an
 * article published later on the run date belongs to the following digest.
 */
export default function weeklyDispatch(request: IncomingMessage, response: ServerResponse) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.writeHead(405).end(JSON.stringify({ error: "Use GET." }));
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const values = new URL(request.url ?? "/", "http://localhost").searchParams.getAll("until");
  const until = values[0] ?? today;
  const end = new Date(until + "T00:00:00Z");
  if (values.length > 1 || !/^\d{4}-\d{2}-\d{2}$/.test(until) ||
      !Number.isFinite(end.getTime()) || end.toISOString().slice(0, 10) !== until || until > today) {
    response.writeHead(400).end(JSON.stringify({ error: "until must be a valid UTC date (YYYY-MM-DD) on or before today." }));
    return;
  }

  end.setUTCDate(end.getUTCDate() - 7);
  const from = end.toISOString().slice(0, 10);
  const items = getNewsNotes()
    .filter(note => note.date >= from && note.date < until)
    .map(({ slug, date, title, summary }) => ({
      slug, date, title, summary,
      url: `https://www.${siteIdentity.domain}/news/${slug}/`,
    }));

  response.end(JSON.stringify({ from, until, items }));
}
