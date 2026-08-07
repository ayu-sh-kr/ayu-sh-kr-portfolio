import { defineConfig } from "vite";
import { resolve } from "path";
import {fileURLToPath} from "node:url";
import tailwindcss from "@tailwindcss/vite";
import {dotaVitePlugins} from "@ayu-sh-kr/dota-wrap/vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const blogRoutes = [
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

export default defineConfig({
  plugins: [
    tailwindcss(),
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
        routes: ["/offline", ...blogRoutes, ...showcaseRoutes],
        vercel: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@app": resolve("./src"),
    },
  },
  publicDir: "public",
});
