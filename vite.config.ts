import {archivePageCount, archivePagePath} from "./src/utils/archive-page.utils.ts";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {fileURLToPath} from "node:url";
import tailwindcss from "@tailwindcss/vite";
import {dotaVitePlugins} from "@ayu-sh-kr/dota-wrap/vite";
import { createLocalApiProxy } from "./src/configs/local-api-proxy.config.ts";
import { localIcons } from "./src/configs/local-icons.config.ts";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const blogRoutes = [
  "/blog/ui-design-trends-skeuomorphism-isometric-glass",
  "/blog/reinforcement-learning-from-rlhf-to-rlsc",
  "/blog/java-native-builds-graalvm-vs-leyden",
  "/blog/what-is-a-native-build",
  "/blog/open-knowledge-format-okf-vs-rag",
  "/blog/why-use-redis-channels",
  "/blog/telepathy-with-ai",
  "/blog/ssr-vs-ssg-rendering-hydration-dom",
  "/blog/aws-app-config-spring-boot-integration",
  "/blog/postgresql-access-control",
  "/blog/distributed-locks-redis",
  "/blog/rate-limiting-token-bucket-spring-boot",
  "/blog/distributed-monolith-extra-invoices",
  "/blog/lambda-pricing-infra-alone",
  "/blog/eventbridge-scheduler-quirks",
  "/blog/business-logic-auth-middleware",
];
const showcaseRoutes = [
  "/showcase/dota-workspace",
  "/showcase/restaurant-oms",
  "/showcase/sacrena",
  "/showcase/indiknots",
  "/showcase/jalans",
  "/showcase/dota-wrap",
  "/showcase/event-pipeline",
  "/showcase/dota-rest",
];
const newsRoutes = [
  "/news/graphvein-cross-repo-code-mapping",
  "/news/claude-ml-research-sabotage-claims",
  "/news/t3-code-telemetry-controversy",
  "/news/fastvm-microvm-sleep-wake-benchmarks",
  "/news/glm-5-4-loop-transformer",
  "/news/crowdstrike-zscaler-acquisition",
  "/news/gemini-lean-quantum-circuits",
  "/news/rayclay-1-c-app-framework",
  "/news/spring-november-release-train-boot-4-2",
  "/news/bending-spoons-mailchimp-acquisition",
  "/news/gpt-6-2-microsoft-mai-gemini-4-neon",
  "/news/openai-research-access-safety-assessments",
  "/news/kiri-rust-container-runtime",
  "/news/lemon-squeezy-shutdown-stripe-migration",
  "/news/pybot-deepseek-agent-swarm-python",
  "/news/gemini-4-argon-carbon-hydrogen-comparison",
  "/news/inkling-2-four-bit-training",
  "/news/openorange-cloudflare-workers-self-hosting",
  "/news/aws-emulator-localstack-local-testing",
  "/news/pan-2-world-model-physical-intelligence",
  "/news/saltline-ai-browser-3d-evolution",
  "/news/tinytraffic-self-hosted-web-analytics",
  "/news/whisker-rust-native-mobile-apps",
  "/news/rust-native-apps-discord-gpui-rune",
  "/news/rune-native-ui-framework",
  "/news/kawa-kafka-gateway",
  "/news/rustle-forward-proxy-benchmarks",
  "/news/ai-agent-cloud-hosting-costs",
  "/news/inkling-2-mini",
  "/news/blink-cpu-free-llm-inference",
  "/news/openai-pando-git-backend-anthropic-scion",
  "/news/mit-weight-space-programming-gpt-6-astra-qwen",
  "/news/tibo-codex-challenge-gpt-6-2-astra-fable-5-5",
  "/news/overflow-design-isometric-drawings",
  "/news/mirendil-fern-10-million-token-context-model",
  "/news/maya-2-native-open-weight-indian-language-speech",
  "/news/pomerado-browser-automation-reusable-mcp-tools",
  "/news/microsoft-quicksand-qemu-agent-sandboxes",
  "/news/flashraw-rust-camera-raw-decoder-benchmarks",
  "/news/ai-sandbox-bench-regions-provider-comparison",
  "/news/jakub-krehel-teardown-technical-illustration-skill",
  "/news/asonix-app-store-keywords-ai-visibility",
  "/news/ascii-animation-web-design",
  "/news/anthropic-open-weight-models-security-timeline",
  "/news/hatchzip-in-place-archive-extraction",
  "/news/kimi-k3-1-pro-frontier-model-comparison",
  "/news/abliterated-models-origin-refusals-use-cases",
  "/news/clickbench-removes-pgrust-benchmark-dispute",
  "/news/deepseek-fireworks-deepinfer-faster-inference",
  "/news/php-critical-rce-october-2026",
  "/news/railway-environment-variables-security-breach",
  "/news/pingcap-tidb-cloud-security-breach",
  "/news/emudhra-weak-certificate-signing-keys",
  "/news/cloudtoid-interprocess-shared-memory-ipc",
  "/news/mcp-discovery-apm-torchneuron-ai-tooling",
  "/news/aws-cloudflare-reinvent-booth-rivalry",
  "/news/opencode-console-breach-api-keys",
  "/news/perplexity-space-firecracker-agent-sandboxes",
  "/news/urban-vpn-ai-chat-harvesting",
  "/news/aws-lambda-web-functions",
  "/news/malicious-ai-routers-agent-supply-chain",
  "/news/rea-rust-app-clones-ai-reverse-engineering",
  "/news/anatomy-claude-code-isometric-svg-webgl",
  "/news/tamagui-3-tailwind-native-runtime",
  "/news/jetbrains-mellum-2-1-coding-agents",
  "/news/weft-ai-coding-agent-coordination",
  "/news/microsoft-surface-laptop-ultra-windows-hybrid-ai",
  "/news/github-copilot-local-model-routing-hydrafusion",
  "/news/aws-strands-box-ai-agent-sandbox",
  "/news/github-git-infrastructure-agent-scale",
  "/news/beam-embeddinggemma-2-flow-1",
  "/news/mistral-large-4-le-chonk-preview",
  "/news/google-fervo-geothermal-396mw",
  "/news/yarrtube-self-hosted-youtube-no-recommendations",
  "/news/angular-native-mobile-apps",
  "/news/aleph-alpha-kolibri-open-weight-model",
  "/news/gitlab-unauthenticated-rate-limits",
  "/news/claude-code-mods-typescript",
  "/news/cloudflare-artifacts-next-git-platform",
  "/news/cloudflare-cf-cli-wrangler-migration",
  "/news/github-copilot-computer-use",
  "/news/pyronaut-python-micronaut-graalvm",
  "/news/decision-models-openai-typesafe-cloudflare",
  "/news/google-gemini-4-argon-pricing-capabilities",
  "/news/instacloud-agent-native-serverless-cloud",
  "/news/kafgres-kafka-broker-postgres-700mbs",
  "/news/phonon-2-small-local-speech-recognition",
  "/news/pageindex-tree-based-rag-relevance",
  "/news/anthropic-contextual-retrieval-rag",
  "/news/antiburn-coding-agent-token-usage",
  "/news/openscience-ai-research-workbench-stable",
  "/news/hacktron-meta-heic-image-bounty",
  "/news/jevgrep-jev-agent-code-search",
  "/news/microsoft-titan-unsigned-jwt-analytics",
  "/news/prek-rust-pre-commit-hooks",
  "/news/github-copilot-runtime-rust-migration",
  "/news/homa-protocol-tcp-datacenter-ai-latency",
  "/news/microsoft-copilot-home-code-autopilot",
  "/news/claude-opus-5-5-cost-coding",
  "/news/docker-sandbox-kit-aws-lambda-microvms-agent-coding",
  "/news/jev-typesafe-system-one-model",
  "/news/jhipster-online-infostealer-malware",
  "/news/cloudflare-trycloudflare-quick-tunnel",
  "/news/zcode-user-code-upload-key",
  "/news/openbot-self-hosted-ai-coworkers",
  "/news/perplexity-cobbledb",
  "/news/qorl-postgres-query-optimizer-rl",
  "/news/prismml-bonsai-2-27b",
];

const archiveRoutes = Array.from({length: archivePageCount(newsRoutes.length) - 1}, (_, index) =>
  archivePagePath(index + 2).slice(0, -1)
);

/**
 * Makes Vite preview serve SSG routes through the same canonical URL shape as production.
 *
 * Dota SSG writes a route such as `/blog/article` to `dist/blog/article/index.html`.
 * Vercel redirects the extensionless URL to `/blog/article/`, which lets the host serve
 * that generated document and lets `dotaHydration()` adopt its marked route host. Vite
 * preview otherwise misses the directory document, serves `dist/index.html`, and forces
 * the client router to replace the home route before it can render the requested page.
 *
 * This plugin runs before preview's SPA fallback. It redirects only GET and HEAD requests
 * whose resolved output directory contains an `index.html`; unknown paths still reach the
 * fallback so client-only routes retain their normal behavior. Queries are preserved and
 * requests already using the trailing-slash canonical form pass through unchanged.
 */
const previewSsgRedirects: Plugin = {
  name: "preview-ssg-redirects",

  /**
   * Registers the pre-fallback redirect middleware for `vite preview` only.
   *
   * The output check makes the redirect data-driven: every route generated by the current
   * build is handled without maintaining a second route list in this config. The containment
   * check keeps a malformed URL from resolving a file outside the configured build output.
   */
  configurePreviewServer(server) {
    server.middlewares.use((request, response, next) => {
      if ((request.method !== "GET" && request.method !== "HEAD") || !request.url) {
        next();
        return;
      }

      const url = new URL(request.url, "http://localhost");
      if (url.pathname === "/" || url.pathname.endsWith("/")) {
        next();
        return;
      }

      const outputDirectory = resolve(server.config.build.outDir);
      const staticRouteDirectory = resolve(outputDirectory, `.${url.pathname}`);
      if (!staticRouteDirectory.startsWith(`${outputDirectory}/`) || !existsSync(resolve(staticRouteDirectory, "index.html"))) {
        next();
        return;
      }

      response.writeHead(308, { Location: `${url.pathname}/${url.search}` });
      response.end();
    });
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");

  return {
    plugins: [
      tailwindcss(),
      previewSsgRedirects,
      localIcons(projectRoot),
      ...dotaVitePlugins({
        root: projectRoot,
        logType: "info",
        scanRoots: [
          projectRoot,
          resolve(projectRoot, "node_modules/@ayu-sh-kr/dota-md"),
          resolve(projectRoot, "node_modules/@ayu-sh-kr/dota-ui"),
        ],
        webTypes: {
          outFile: "web-types.json",
          customElementsManifest: { enabled: true },
        },
        eventMap: {
          outFile: "src/event-map.d.ts",
        },
        ssg: {
          entry: "/src/main.ts",
          autoDetectRoutes: true,
          routes: ["/offline", ...archiveRoutes, ...blogRoutes, ...newsRoutes, ...showcaseRoutes],
          // Route documents are independent, so prerender them across isolated workers.
          concurrency: 4,
          // Vercel updates the existing vercel.json; kept explicitly in the new deployment form.
          deployment: "vercel",
        },
      }),
    ],
    server: {
      proxy: mode === "development"
        ? createLocalApiProxy(env.VITE_DEV_API_TARGET || "http://localhost:8080", env.VITE_DEV_CLIENT_REGION || "IN")
        : undefined,
    },
    resolve: {
      alias: {
        "@app": resolve("./src"),
      },
    },
    ssr: {
      external: ["@ayu-sh-kr/dota-rest"],
    },
    publicDir: "public",
  };
});
