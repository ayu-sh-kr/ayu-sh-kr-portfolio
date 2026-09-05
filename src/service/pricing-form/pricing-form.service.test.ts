import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";
import {
  PricingFormService,
  rejectServerFailure,
  toPricingFormRequest,
  toSubmissionResponse,
  toUploadUrlResponse,
} from "./pricing-form.service.ts";
import { createBrief, isApiError, mockRestClient } from "../../../test/fixtures/pricing-form.fixture.ts";

describe("toPricingFormRequest", () => {
  it("maps the idea branch plus shared base, nulling empty optional strings", () => {
    const body = toPricingFormRequest(createBrief());

    assert.equal(body.mode, "idea");
    assert.equal(body.name, "Priya Raghavan");
    assert.equal(body.email, "priya@example.com");
    assert.equal(body.needsNda, false);
    assert.equal(body.nextStep, "REPLY_BY_EMAIL");
    assert.deepEqual(body.existing, ["Live product"]);
    assert.deepEqual(body.files, []);
    assert.equal(body.company, null);
    assert.equal(body.idea, "A client intake portal");
    assert.equal(body.audience, "Early-stage founders");
    assert.equal(body.success, "Ten qualified inquiries a month");
    assert.equal(body.budget, "Under $3k");
    assert.equal(body.timeline, "Within a month");
    assert.equal("workType" in body, false, "inactive branch fields are omitted");
    assert.equal("projectName" in body, false);
  });

  it("maps the spec branch and nulls its optional fields", () => {
    const body = toPricingFormRequest(createBrief({ mode: "spec", projectName: "Portal v2", specLink: "", specNotes: "" }));

    assert.equal(body.mode, "spec");
    assert.equal(body.projectName, "Portal v2");
    assert.equal(body.specLink, null);
    assert.equal(body.specNotes, null);
    assert.equal("idea" in body, false);
    assert.equal("budget" in body, false, "spec submissions carry no budget or timeline");
  });

  it("maps the quote branch", () => {
    const body = toPricingFormRequest(createBrief({ mode: "quote", workType: "AWS infrastructure", scope: "Full rebuild", constraints: "", budget: "", timeline: "Exploratory" }));

    assert.equal(body.mode, "quote");
    assert.equal(body.workType, "AWS infrastructure");
    assert.equal(body.scope, "Full rebuild");
    assert.equal(body.constraints, null);
    assert.equal(body.budget, null);
    assert.equal(body.timeline, "Exploratory");
  });

  it("keeps only uploaded attachments that carry a storage key", () => {
    const body = toPricingFormRequest(createBrief({
      files: [
        { id: "a", name: "spec.pdf", size: 10, status: "uploaded", key: "tmp/a" },
        { id: "b", name: "draft.pdf", size: 5, status: "uploading" },
        { id: "c", name: "failed.pdf", size: 5, status: "error", key: "tmp/c" },
        { id: "d", name: "nokey.pdf", size: 5, status: "uploaded" },
      ],
    }));

    assert.deepEqual(body.files, [{ id: "a", name: "spec.pdf", size: 10, status: "uploaded", key: "tmp/a" }]);
  });
});

describe("rejectServerFailure", () => {
  it("throws PricingFormApiError for 5xx and ignores 4xx/2xx", () => {
    assert.throws(() => rejectServerFailure({ status: 500 }), isApiError);
    assert.throws(() => rejectServerFailure({ status: 503 }), isApiError);
    rejectServerFailure({ status: 400 });
    rejectServerFailure({ status: 200 });
  });
});

describe("toSubmissionResponse", () => {
  it("accepts only a numeric id with RECEIVED status", () => {
    assert.deepEqual(toSubmissionResponse({ id: 9, status: "RECEIVED" }), { id: 9, status: "RECEIVED" });
    assert.throws(() => toSubmissionResponse({ id: 1, status: "QUEUED" }), isApiError);
    assert.throws(() => toSubmissionResponse({ status: "RECEIVED" }), isApiError);
    assert.throws(() => toSubmissionResponse({ id: "1", status: "RECEIVED" }), isApiError);
    assert.throws(() => toSubmissionResponse(null), isApiError);
  });
});

describe("toUploadUrlResponse", () => {
  it("accepts uploadUrl plus key and keeps expiresInSeconds optional", () => {
    assert.deepEqual(toUploadUrlResponse({ uploadUrl: "https://s3.example/x", key: "tmp/x", expiresInSeconds: 300 }),
      { uploadUrl: "https://s3.example/x", key: "tmp/x", expiresInSeconds: 300 });
    assert.equal(toUploadUrlResponse({ uploadUrl: "u", key: "k" }).expiresInSeconds, undefined);
    assert.throws(() => toUploadUrlResponse({ uploadUrl: 1, key: "k" }), isApiError);
    assert.throws(() => toUploadUrlResponse({ uploadUrl: "u" }), isApiError);
    assert.throws(() => toUploadUrlResponse(null), isApiError);
  });
});

describe("PricingFormService.submitBrief", () => {
  it("posts the translated brief to /pricing-form and returns the tracking id", async () => {
    const chain = mockRestClient({ status: 200, data: { id: 7, status: "RECEIVED" } });
    const service = new PricingFormService();
    const result = await service.submitBrief(createBrief());

    assert.equal(chain.calls.uri, "/pricing-form");
    assert.deepEqual(result, { id: 7, status: "RECEIVED" });
    assert.equal((chain.calls.body as Record<string, unknown>).mode, "idea");
  });

  it("rejects non-2xx entities", async () => {
    mockRestClient({ status: 400, data: { id: 1, status: "RECEIVED" } });
    const service = new PricingFormService();
    await assert.rejects(service.submitBrief(createBrief()), isApiError);
  });
});

describe("PricingFormService.createUploadUrl", () => {
  it("requests a scoped pre-signed URL for the file", async () => {
    const chain = mockRestClient({ status: 200, data: { uploadUrl: "https://s3.example/x", key: "tmp/x", expiresInSeconds: 300 } });
    const service = new PricingFormService();
    const result = await service.createUploadUrl(new File(["hello"], "notes.txt", { type: "text/plain" }));

    assert.equal(chain.calls.uri, "/pricing-form/files/upload-url");
    assert.deepEqual(chain.calls.body, { fileName: "notes.txt", contentType: "text/plain" });
    assert.deepEqual(result, { uploadUrl: "https://s3.example/x", key: "tmp/x", expiresInSeconds: 300 });
  });

  it("falls back to an octet-stream content type when the file has none", async () => {
    const chain = mockRestClient({ status: 200, data: { uploadUrl: "https://s3.example/y", key: "tmp/y" } });
    const service = new PricingFormService();
    const result = await service.createUploadUrl(new File(["a"], "blob"));

    assert.deepEqual(chain.calls.body, { fileName: "blob", contentType: "application/octet-stream" });
    assert.equal(result.expiresInSeconds, undefined);
  });

  it("rejects non-2xx entities", async () => {
    mockRestClient({ status: 500, data: {} });
    const service = new PricingFormService();
    await assert.rejects(
      service.createUploadUrl(new File(["a"], "a.txt")),
      (error: unknown) => error instanceof Error && error.name === "PricingFormApiError" && "status" in error && error.status === 500,
    );
  });
});

describe("PricingFormService.uploadFile", () => {
  it("PUTs the body with scoped headers and rejects on failure", async () => {
    const service = new PricingFormService();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    await service.uploadFile(new File(["body"], "a.txt", { type: "text/plain" }), { uploadUrl: "https://s3.example/z", key: "tmp/z" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    assert.equal(url, "https://s3.example/z");
    assert.equal(init.method, "PUT");
    fetchMock.mockRestore();

    const failingFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 403 }));
    await assert.rejects(
      service.uploadFile(new File(["body"], "a.txt"), { uploadUrl: "https://s3.example/z", key: "tmp/z" }),
      (error: unknown) => error instanceof Error && error.name === "PricingFormApiError" && "status" in error && error.status === 403,
    );
    failingFetch.mockRestore();
  });
});
