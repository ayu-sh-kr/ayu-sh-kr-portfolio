import assert from "node:assert/strict";
import {describe, it} from "vitest";
import {getNewsNote, getNewsNotes, getNewsSeo, getNewsSlug} from "./news.config.ts";

describe("news configuration", () => {
  it("orders notes newest-first and keeps article summaries aligned with feed copy", () => {
    const notes = getNewsNotes();

    assert.ok(notes.length >= 9);
    assert.equal(notes[0]?.slug, "qorl-postgres-query-optimizer-rl");
    assert.ok(notes.every((note, index) => index === 0 || notes[index - 1]!.date >= note.date));
    assert.ok(notes.every((note) => getNewsSeo(note).description === note.summary));
  });

  it("resolves canonical slugs and rejects malformed or nested news paths", () => {
    assert.equal(getNewsSlug("/news/graalvm-lambda-cold-start/"), "graalvm-lambda-cold-start");
    assert.equal(getNewsNote(getNewsSlug("/news/graalvm-lambda-cold-start"))?.kind, "infra");
    assert.equal(getNewsSlug("/news/one/two"), "");
    assert.equal(getNewsSlug("/news/%E0%A4%A"), "");
  });
});
