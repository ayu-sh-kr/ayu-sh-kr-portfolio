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

    await service.recordViewV1(slug);
    const duplicate = await service.recordViewV1(slug);

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

    await assert.rejects(new BlogViewCountService().recordViewV1(slug));

    assert.equal(scope.has(slug), false);
  });
});

describe("BlogViewCountService.recordViewV2", () => {
  it("posts the URL-encoded slug and explicit content type to the v2 endpoint", async () => {
    const calls: { uri?: string } = {};
    let convert: ((data: unknown) => unknown) | undefined;
    const entity = {status: 200, data: {slug: "showcase / one", viewCount: 4}};
    const chain = {
      uri(uri: string) { calls.uri = uri; return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter(converter: (data: unknown) => unknown) { convert = converter; return chain; },
      toEntity() { return Promise.resolve({...entity, data: convert?.(entity.data) ?? entity.data}); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = {post: () => chain};

    const service = new BlogViewCountService();
    const trackingKey = "v2:SHOWCASE:showcase / one";
    AppStorage.scope("blog-view-tracking").remove(trackingKey);

    const result = await service.recordViewV2("showcase / one", "SHOWCASE");

    assert.equal(calls.uri, "/blog/view/v2?slug=showcase%20%2F%20one&type=SHOWCASE");
    assert.deepEqual(result, entity.data);
    AppStorage.scope("blog-view-tracking").remove(trackingKey);
  });

  it("writes a five-minute local marker after a successful request and suppresses duplicates", async () => {
    const scope = AppStorage.scope("blog-view-tracking");
    const trackingKey = "v2:BLOG:deduplicated-v2-view";
    scope.remove(trackingKey);

    let requests = 0;
    const chain = {
      uri() { return chain; },
      retrieve() { return chain; },
      handler() { return chain; },
      converter() { return chain; },
      toEntity() { return Promise.resolve({status: 200, data: {slug: "deduplicated-v2-view", viewCount: 1}}); },
    };
    (window as unknown as Record<string, unknown>).portfolioRestClient = {post: () => { requests += 1; return chain; }};

    const service = new BlogViewCountService();
    await service.recordViewV2("deduplicated-v2-view", "BLOG");
    const duplicate = await service.recordViewV2("deduplicated-v2-view", "BLOG");

    assert.equal(requests, 1);
    assert.equal(duplicate, null);
    scope.remove(trackingKey);
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
