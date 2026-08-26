import type { PricingStartProjectBrief } from "../../src/events/pricing.events.ts";

/** Fluent-call state captured by the pricing-form REST client fixture. */
export interface MockChain {
  calls: { uri?: string; body?: unknown };
}

/** Installs a controllable fluent REST client on the DOM window. */
export function mockRestClient(entity: { status: number; data: unknown }): MockChain {
  const chain: MockChain = { calls: {} };

  const step: Record<string, (...args: never[]) => unknown> = {
    uri: ((uri: string) => {
      chain.calls.uri = uri;
      return step;
    }) as (...args: never[]) => unknown,
    body: ((body: unknown) => {
      chain.calls.body = body;
      return step;
    }) as (...args: never[]) => unknown,
    retrieve: () => step,
    handler: () => step,
    converter: () => step,
    toEntity: () => Promise.resolve(entity),
  };

  (window as unknown as Record<string, unknown>).portfolioRestClient = {
    post: () => step,
  };

  return chain;
}

/** Creates a valid idea brief that individual tests can override for another branch or field. */
export function createBrief(overrides: Partial<PricingStartProjectBrief> = {}): PricingStartProjectBrief {
  return {
    mode: "idea",
    projectName: "",
    specLink: "",
    specNotes: "",
    idea: "A client intake portal",
    audience: "Early-stage founders",
    success: "Ten qualified inquiries a month",
    workType: "",
    scope: "",
    constraints: "",
    existing: ["Live product"],
    budget: "Under $3k",
    timeline: "Within a month",
    files: [],
    name: "Priya Raghavan",
    email: "priya@example.com",
    company: "",
    nextStep: "Reply by email",
    needsNda: false,
    ...overrides,
  };
}

/** Recognizes the service's transport error without coupling tests to its module instance. */
export const isApiError = (error: unknown): boolean => error instanceof Error && error.name === "PricingFormApiError";
