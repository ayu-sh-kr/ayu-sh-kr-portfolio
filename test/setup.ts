/** Clears service-owned browser globals between Vitest test cases. */
import { afterEach } from "vitest";

afterEach(() => {
  delete (window as unknown as Record<string, unknown>).portfolioRestClient;
});
