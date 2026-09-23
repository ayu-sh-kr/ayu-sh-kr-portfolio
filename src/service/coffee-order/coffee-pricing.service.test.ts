import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { CoffeePricingService, formatCoffeeAmount } from "./coffee-pricing.service.ts";

function mockLocale(region: string): { calls: { uri?: string } } {
  const calls: { uri?: string } = {};
  const chain = {
    uri(uri: string) {
      calls.uri = uri;
      return chain;
    },
    retrieve() {
      return chain;
    },
    toEntity() {
      return Promise.resolve({ status: 200, data: { region } });
    },
  };
  (window as unknown as Record<string, unknown>).portfolioRestClient = { get: () => chain };
  return calls;
}

describe("CoffeePricingService", () => {
  it("uses the locale API region to select INR and caches that response", async () => {
    const calls = mockLocale("IN");
    const service = new CoffeePricingService();

    assert.equal(await service.getCurrency(), "INR");
    assert.equal(await service.getCurrency(), "INR");

    assert.equal(calls.uri, "/locale");
  });

  it("uses USD for every region other than India", async () => {
    mockLocale("GB");
    const service = new CoffeePricingService();

    assert.equal(await service.getCurrency(), "USD");
  });

  it("formats each fixed option currency for its display locale", () => {
    assert.equal(formatCoffeeAmount(499, "INR"), "₹499");
    assert.equal(formatCoffeeAmount(5, "USD"), "$5");
  });
});
