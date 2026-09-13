import assert from "node:assert/strict";
import {afterEach, describe, it, vi} from "vitest";
import {getNewsNotes} from "@app/configs/news.config.ts";
import {NewsLoaderService} from "./news-loader.service.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NewsLoaderService.load", () => {
  it("requests the configured Markdown document with the caller's abort signal", async () => {
    const note = getNewsNotes()[0]!;
    const request = new AbortController();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("# Loaded note"));

    const markdown = await new NewsLoaderService().load(note, request.signal);

    assert.equal(markdown, "# Loaded note");
    assert.equal(fetchMock.mock.calls[0]?.[0], encodeURI(note.document));
    assert.equal((fetchMock.mock.calls[0]?.[1] as RequestInit).signal, request.signal);
  });

  it("rejects an unsuccessful document response with its status", async () => {
    const note = getNewsNotes()[0]!;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("missing", {status: 404}));

    await assert.rejects(
      new NewsLoaderService().load(note, new AbortController().signal),
      new RegExp(`Unable to load ${note.document.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(404\\\)`),
    );
  });
});
