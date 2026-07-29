import { defineConfig } from "vite";
import { resolve } from "path";
import {fileURLToPath} from "node:url";
import tailwindcss from "@tailwindcss/vite";
import dotaVitePreloader from "@ayu-sh-kr/dota-wrap/preloader-plugin";
import dotaWebTypeJson from "@ayu-sh-kr/dota-wrap/web-type-json";
import eventMapGenerator from "@ayu-sh-kr/dota-wrap/event-map-generator";
import { nitro } from "nitro/vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const nitroPreset = process.env.NITRO_PRESET ?? (process.env.VERCEL ? "vercel" : "node");

export default defineConfig({
  plugins: [
    tailwindcss(),
    dotaVitePreloader({
      root: resolve(__dirname),
      logType: "info",
    }),
    dotaWebTypeJson({
      root: resolve(__dirname),
      scanRoots: [
        resolve(__dirname),
        resolve(__dirname, "node_modules/@ayu-sh-kr/dota-md"),
        resolve(__dirname, "node_modules/@ayu-sh-kr/dota-ui"),
      ],
      outFile: "web-types.json",
      logType: "info",
      customElementsManifest: {
        enabled: true
      }
    }),
    eventMapGenerator({
      root: projectRoot,
      scanRoots: [
        projectRoot,
        resolve(projectRoot, 'node_modules/@ayu-sh-kr/dota-md'),
        resolve(projectRoot, 'node_modules/@ayu-sh-kr/dota-ui'),
      ],
      outFile: 'src/event-map.d.ts',
      moduleSpecifier: '@ayu-sh-kr/dota-wrap/event',
      logType: 'info',
    }),
    nitro({
      serverDir: "./server",
      preset: nitroPreset,
    }),
  ],
  resolve: {
    alias: {
      "@app": resolve("./src"),
    },
  },
  publicDir: "public",
});
