import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  SupportTicketApiError,
  SupportTicketService,
  type SupportTicketRequest,
} from "./support-ticket.service.ts";

describe("SupportTicketService.submitTicket", () => {
  it("rejects a malformed acknowledgement returned by the support API", async () => {
    let convert: ((data: unknown) => unknown) | undefined;
    const chain = {
      uri() { return chain; },
      body() { return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter(converter: (data: unknown) => unknown) { convert = converter; return chain; },
      toEntity() {
        return Promise.resolve({ status: 200, data: convert?.({ status: "RECEIVED" }) });
      },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = { post: () => chain };
    const service = new SupportTicketService();
    const request: SupportTicketRequest = {
      name: "Ada Lovelace", email: "ada@example.com", topic: null,
      message: "The callback fails.", files: [],
    };

    await assert.rejects(
      service.submitTicket(request),
      (error: unknown) => error instanceof SupportTicketApiError && error.status === 0,
    );
  });

  it("rejects a non-success response without accepting its acknowledgement", async () => {
    const chain = {
      uri() { return chain; },
      body() { return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter() { return chain; },
      toEntity() { return Promise.resolve({ status: 400, data: { id: 42, status: "RECEIVED" } }); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = { post: () => chain };
    const service = new SupportTicketService();
    const request: SupportTicketRequest = {
      name: "Ada Lovelace", email: "ada@example.com", topic: null,
      message: "The callback fails.", files: [],
    };

    await assert.rejects(
      service.submitTicket(request),
      (error: unknown) => error instanceof SupportTicketApiError && error.status === 400,
    );
  });

  it("posts completed attachment metadata and returns the received acknowledgement", async () => {
    const calls: { uri?: string; body?: unknown } = {};
    let convert: ((data: unknown) => unknown) | undefined;
    const response = { id: 42, status: "RECEIVED" };
    const chain = {
      uri(uri: string) { calls.uri = uri; return chain; },
      body(body: unknown) { calls.body = body; return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter(converter: (data: unknown) => unknown) { convert = converter; return chain; },
      toEntity() { return Promise.resolve({ status: 200, data: convert?.(response) ?? response }); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = { post: () => chain };
    const service = new SupportTicketService();
    const request: SupportTicketRequest = {
      name: "Ada Lovelace", email: "ada@example.com", topic: "A bug",
      message: "The callback fails.",
      files: [{
        id: "ed7f79f7-e961-44e4-8fa1-c5f0cf229854", name: "callback.log", size: 512,
        status: "uploaded", key: "staged/callback.log",
      }],
    };

    const result = await service.submitTicket(request);

    assert.equal(calls.uri, "/support-ticket");
    assert.deepEqual(calls.body, request);
    assert.deepEqual(result, response);
  });
});
