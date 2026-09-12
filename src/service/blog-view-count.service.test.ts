import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  BlogViewCountApiError,
  BlogViewCountService,
  toBlogViewTrackingFailureReason,
} from "./blog-view-count.service.ts";
import {AppStorage} from "./storage.service.ts";

describe("BlogViewCountService.recordView", () => {
  it("posts the URL-encoded blog slug to the view-tracking endpoint", async () => {
    const calls: { uri?: string } = {};
    let convert: ((data: unknown) => unknown) | undefined;
    const entity = { status: 200, data: { slug: "redis pub/sub", viewCount: 4 } };
    const chain = {
      uri(uri: string) { calls.uri = uri; return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter(converter: (data: unknown) => unknown) { convert = converter; return chain; },
      toEntity() { return Promise.resolve({ ...entity, data: convert?.(entity.data) ?? entity.data }); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = { post: () => chain };
    const service = new BlogViewCountService();

    const result = await service.recordView("redis pub/sub");

    assert.equal(calls.uri, "/blog/view?slug=redis%20pub%2Fsub");
    assert.deepEqual(result, entity.data);
  });

  it("writes a five-minute local marker after a successful request and suppresses duplicates", async () => {
    const scope = AppStorage.scope("blog-view-tracking");
    const slug = "deduplicated-view";
    scope.remove(slug);

    let requests = 0;
    const entity = {status: 200, data: {slug, viewCount: 1}};
    const chain = {
      uri() { return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter() { return chain; },
      toEntity() { return Promise.resolve(entity); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = {
      post: () => {
        requests += 1;
        assert.equal(scope.has(slug), false);
        return chain;
      },
    };
    const service = new BlogViewCountService();

    await service.recordView(slug);
    const duplicate = await service.recordView(slug);

    assert.equal(requests, 1);
    assert.equal(duplicate, null);
    scope.remove(slug);
  });

  it("does not throttle a slug when its tracking request fails", async () => {
    const scope = AppStorage.scope("blog-view-tracking");
    const slug = "retry-after-failure";
    scope.remove(slug);

    const chain = {
      uri() { return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter() { return chain; },
      toEntity() { return Promise.reject(new Error("offline")); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = {post: () => chain};

    await assert.rejects(new BlogViewCountService().recordView(slug));

    assert.equal(scope.has(slug), false);
  });
});

describe("toBlogViewTrackingFailureReason", () => {
  it("keeps tracking failures privacy-safe for GA4", () => {
    assert.equal(toBlogViewTrackingFailureReason(new Error("offline")), "network");
    assert.equal(toBlogViewTrackingFailureReason(new BlogViewCountApiError(0)), "invalid_response");
    assert.equal(toBlogViewTrackingFailureReason(new BlogViewCountApiError(400)), "client");
    assert.equal(toBlogViewTrackingFailureReason(new BlogViewCountApiError(503)), "server");
  });
});
