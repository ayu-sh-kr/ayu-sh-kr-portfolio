import {resolve} from "node:path";
import {defineConfig} from "vitest/config";

export default defineConfig({
  resolve: {alias: {"@app": resolve("src")}},
  test: {environment: "happy-dom", include: ["scripts/benchmarks/rendering.bench.ts"], testTimeout: 120000},
});
