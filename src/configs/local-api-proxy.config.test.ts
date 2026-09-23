import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { createLocalApiProxy } from "./local-api-proxy.config.ts";

describe("createLocalApiProxy", () => {
  it("proxies locale lookup with a configurable local region profile", () => {
    const proxy = createLocalApiProxy("http://localhost:8080", "US");

    assert.equal(proxy["/locale"].target, "http://localhost:8080");
    assert.equal(proxy["/locale"].headers["X-Client-Region"], "US");
    assert.equal(proxy["/locale"].headers["X-Client-Locale"], "en-US");
    assert.equal(proxy["/razorpay"].headers["X-Client-Region"], "US");
  });
});
