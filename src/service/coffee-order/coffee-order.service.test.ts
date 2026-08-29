import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { CoffeeOrderService } from "./coffee-order.service.ts";

interface MockChain {
  calls: { uri?: string; body?: unknown };
}

function mockPost(entity: { status: number; data: unknown }): MockChain {
  const chain: MockChain = { calls: {} };
  let convert: ((data: unknown) => unknown) | undefined;
  const step = {
    uri(uri: string) {
      chain.calls.uri = uri;
      return step;
    },
    body(body: unknown) {
      chain.calls.body = body;
      return step;
    },
    retrieve() {
      return step;
    },
    handler() {
      return step;
    },
    converter(converter: (data: unknown) => unknown) {
      convert = converter;
      return step;
    },
    toEntity() {
      return Promise.resolve({ ...entity, data: convert ? convert(entity.data) : entity.data });
    },
  };

  (window as unknown as Record<string, unknown>).portfolioRestClient = { post: () => step };
  return chain;
}

describe("CoffeeOrderService.createPaymentLink", () => {
  it("posts the paid amount in paise to the coffee order API", async () => {
    const chain = mockPost({ status: 200, data: { id: "plink_123", short_url: "https://rzp.io/i/coffee" } });
    const service = new CoffeeOrderService();

    const result = await service.createPaymentLink({ amount: 1500, name: "Priya", shortNote: "Keep going" });

    assert.equal(chain.calls.uri, "/buy-coffee/order");
    assert.deepEqual(chain.calls.body, { amount: 1500, name: "Priya", shortNote: "Keep going" });
    assert.deepEqual(result, { id: "plink_123", short_url: "https://rzp.io/i/coffee" });
  });

  it("sends null for an omitted note and rejects an invalid payment URL", async () => {
    const chain = mockPost({ status: 200, data: { id: "plink_123", short_url: "https://rzp.io/i/coffee" } });
    const service = new CoffeeOrderService();

    await service.createPaymentLink({ amount: 500, name: "Anonymous" });
    assert.deepEqual(chain.calls.body, { amount: 500, name: "Anonymous", shortNote: null });

    mockPost({ status: 200, data: { id: "plink_123", short_url: "/invalid" } });
    await assert.rejects(service.createPaymentLink({ amount: 500, name: "Anonymous" }), (error: unknown) =>
      error instanceof Error && error.name === "CoffeeOrderApiError",
    );
  });
});
