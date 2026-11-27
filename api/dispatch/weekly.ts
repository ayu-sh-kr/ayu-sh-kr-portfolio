import type {IncomingMessage, ServerResponse} from "node:http";
import {newsNotes} from "../../src/configs/news.config.ts";
import {createDispatchQuery, InvalidDispatchQuery} from "../../server/dispatch/query.ts";

const query = createDispatchQuery(newsNotes);

/** The scheduled digest uses complete UTC days. Pin both boundaries when paging. */
export default function weeklyDispatch(request: IncomingMessage, response: ServerResponse) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.writeHead(405).end(JSON.stringify({error: "Use GET."}));
    return;
  }
  try {
    const params = new URL(request.url ?? "/", "http://localhost").searchParams;
    response.end(JSON.stringify(query(params, new Date().toISOString().slice(0, 10))));
  } catch (error) {
    if (!(error instanceof InvalidDispatchQuery)) throw error;
    response.writeHead(400).end(JSON.stringify({error: error.message}));
  }
}
