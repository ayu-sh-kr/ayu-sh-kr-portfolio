// Run with Node 24: node scripts/benchmark-dispatch.mjs
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {performance} from "node:perf_hooks";
import {newsNotes} from "../src/configs/news.config.ts";
import {createDispatchQuery} from "../server/dispatch/query.ts";
import weeklyDispatch from "../api/dispatch/weekly.ts";

const today = "2026-11-27";
const server = createServer(weeklyDispatch);
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
try {
  const base = `http://127.0.0.1:${server.address().port}/api/dispatch/weekly?until=${today}`;
  const weekly = await (await fetch(base)).json();
  assert.equal(weekly.items.length, newsNotes.filter(n => n.date >= "2026-11-20" && n.date < today).length);
  const expected = newsNotes.filter(n => n.kind === "take" && n.date >= "2026-01-01" && n.date < today)
    .sort((a,b) => b.date.localeCompare(a.date)).map(n => n.slug);
  const actual = [];
  let offset = 0;
  do {
    const res = await fetch(base + "&from=2026-01-01&kind=take&limit=2&offset=" + offset);
    assert.equal(res.status, 200);
    const page = await res.json();
    assert.equal(page.total, expected.length);
    actual.push(...page.items.map(item => item.slug));
    offset = page.nextOffset;
  } while (offset !== null);
  assert.deepEqual(actual, expected);
  for (const invalid of ["limit=0", "until=2026-01-01", "kind=bad", "from=2026-02-30", "offset=-1"]) {
    assert.equal((await fetch(base + "&" + invalid)).status, 400);
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}

// Synthetic entries reuse real summaries with unique slugs across 365 publication days.
for (const size of [newsNotes.length, 10_000, 100_000]) {
  const catalog = size === newsNotes.length ? newsNotes : Array.from({length:size}, (_, i) => ({
    ...newsNotes[i % newsNotes.length], slug: "dispatch-" + i,
    date: new Date(Date.UTC(2026,10,26) - ((i * 137) % 365) * 86400000).toISOString().slice(0,10),
  }));
  const start = performance.now();
  const query = createDispatchQuery(catalog);
  const indexMs = performance.now() - start;
  for (const filter of ["until=" + today, "from=2025-11-27&until=" + today + "&limit=50&offset=" + Math.floor(size/2)]) {
    const run = () => JSON.stringify(query(new URLSearchParams(filter), today));
    for (let i = 0; i < 50; i++) run();
    const samples = [];
    for (let i = 0; i < 500; i++) {
      const begin = performance.now();
      run();
      samples.push(performance.now() - begin);
    }
    samples.sort((a,b) => a-b);
    const body = run();
    console.log({size, indexMs: +indexMs.toFixed(2), items: JSON.parse(body).items.length,
      bytes: Buffer.byteLength(body), p95Ms: +samples[474].toFixed(3)});
  }
}
