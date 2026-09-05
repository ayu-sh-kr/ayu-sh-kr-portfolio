import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";
import {
  ClientFileUploadApiError,
  ClientFileUploadService,
  toClientFileUploadResponse,
} from "./client-file-upload.service.ts";

/**
 * Verifies the shared upload transport independently of pricing and support callers.
 * Each test installs only the fluent REST-client behavior needed for its branch, then checks the
 * exact endpoint, request body, direct PUT, and translated error contract at that boundary.
 */
describe("ClientFileUploadService", () => {
  it("requests a scoped upload target from the configured endpoint", async () => {
    const calls: { uri?: string; body?: unknown } = {};
    const entity = {
      status: 200,
      data: { uploadUrl: "https://s3.example/support", key: "tmp/support", expiresInSeconds: 300 },
    };
    let convert: ((data: unknown) => unknown) | undefined;
    const chain = {
      uri(uri: string) { calls.uri = uri; return chain; },
      body(body: unknown) { calls.body = body; return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter(converter: (data: unknown) => unknown) { convert = converter; return chain; },
      toEntity() { return Promise.resolve({ ...entity, data: convert?.(entity.data) ?? entity.data }); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = { post: () => chain };
    const service = new ClientFileUploadService("/support-ticket/files/upload-url");
    const file = new File(["details"], "details.log", { type: "text/plain" });

    const result = await service.createUploadUrl(file);

    assert.equal(calls.uri, "/support-ticket/files/upload-url");
    assert.deepEqual(calls.body, { fileName: "details.log", contentType: "text/plain" });
    assert.deepEqual(result, entity.data);
  });

  it("uses octet-stream when the selected file has no content type", async () => {
    const calls: { body?: unknown } = {};
    const chain = {
      uri() { return chain; },
      body(body: unknown) { calls.body = body; return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter() { return chain; },
      toEntity() { return Promise.resolve({ status: 200, data: { uploadUrl: "u", key: "k" } }); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = { post: () => chain };
    const service = new ClientFileUploadService("/support-ticket/files/upload-url");

    await service.createUploadUrl(new File(["details"], "details.log"));

    assert.deepEqual(calls.body, { fileName: "details.log", contentType: "application/octet-stream" });
  });

  it("rejects server failures before interpreting the upload response", async () => {
    let handleResponse: ((response: { status: number }) => void) | undefined;
    const chain = {
      uri() { return chain; },
      body() { return chain; },
      retrieve() { return chain; },
      handler(handler: (response: { status: number }) => void) {
        handleResponse = handler;
        return chain;
      },
      converter() { return chain; },
      toEntity() {
        handleResponse?.({ status: 503 });
        return Promise.resolve({ status: 503, data: {} });
      },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = { post: () => chain };
    const service = new ClientFileUploadService("/support-ticket/files/upload-url");

    await assert.rejects(service.createUploadUrl(new File(["details"], "details.log")), (error: unknown) =>
      error instanceof ClientFileUploadApiError && error.status === 503);
  });

  it("rejects an invalid upload target payload before returning access", async () => {
    assert.throws(
      () => toClientFileUploadResponse({ uploadUrl: "https://s3.example/support" }),
      (error: unknown) => error instanceof ClientFileUploadApiError && error.status === 0,
    );
  });

  it("puts the file body directly to the signed URL", async () => {
    const service = new ClientFileUploadService("/support-ticket/files/upload-url");
    const file = new File(["details"], "details.log", { type: "text/plain" });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    await service.uploadFile(file, { uploadUrl: "https://s3.example/support", key: "tmp/support" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    assert.equal(url, "https://s3.example/support");
    assert.equal(init.method, "PUT");
    assert.equal(init.body, file);
    assert.deepEqual(init.headers, { "Content-Type": "text/plain" });
    fetchMock.mockRestore();
  });

  it("translates a rejected direct upload into the shared error contract", async () => {
    const service = new ClientFileUploadService("/support-ticket/files/upload-url");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 403 }));

    await assert.rejects(
      service.uploadFile(new File(["details"], "details.log"), { uploadUrl: "https://s3.example/support", key: "tmp/support" }),
      (error: unknown) => error instanceof ClientFileUploadApiError && error.status === 403,
    );
    fetchMock.mockRestore();
  });
});
