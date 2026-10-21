import { glob, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { getIconData, iconToHTML, iconToSVG } from "@iconify/utils";
import type { Plugin } from "vite";

/** Icon set JSON as `@iconify/utils` reads it. */
type IconifyJSON = Parameters<typeof getIconData>[0];

/** Collections installed as `@iconify-json/*` packages; their icons build without network access. */
export const LOCAL_ICON_COLLECTIONS = ["lucide", "material-symbols", "mdi", "ri"] as const;

/** Output directory, relative to the Vite base, that `IconsComponent.baseUrl` points at. */
export const ICON_ASSET_PATH = "assets/icons/";

const ICON_NAME_PATTERN = /^[a-z0-9-]+:[a-z0-9-]+$/;
const require = createRequire(import.meta.url);

/**
 * Renders icons from the installed Iconify sets, so builds never depend on `api.iconify.design`,
 * which rate limits and leaves the browser with empty icons when it refuses a request.
 */
export class LocalIconSets {
  private readonly sets = new Map<string, Promise<IconifyJSON | null>>();

  /**
   * @param name Iconify name such as `material-symbols:menu-rounded`.
   * @returns The icon as a standalone SVG matching the Iconify API output, or null when the
   *   collection is not installed or has no such icon.
   */
  async get(name: string): Promise<string | null> {
    const [prefix, icon] = name.split(":");
    if (!prefix || !icon) return null;
    const set = await this.load(prefix);
    const data = set && getIconData(set, icon);
    if (!data) return null;
    const { attributes, body } = iconToSVG(data, { height: "1em" });
    return iconToHTML(body, attributes);
  }

  private load(prefix: string): Promise<IconifyJSON | null> {
    if (!(LOCAL_ICON_COLLECTIONS as readonly string[]).includes(prefix)) return Promise.resolve(null);
    let set = this.sets.get(prefix);
    if (!set) {
      set = readFile(require.resolve(`@iconify-json/${prefix}/icons.json`), "utf8")
        .then((text) => JSON.parse(text) as IconifyJSON)
        .catch(() => null);
      this.sets.set(prefix, set);
    }
    return set;
  }
}

/**
 * Publishes every icon named in the given sources as a same-origin asset under `assets/icons/`.
 *
 * The build scans the sources for names from the installed collections and emits their SVGs, so
 * prerendering and the browser read icons from the site instead of Iconify. During development,
 * the middleware serves installed icons and forwards other names to Iconify. On Vercel, a name
 * chosen at runtime that the build did not emit is proxied to Iconify by the
 * `/assets/icons/:icon` rewrite in `vercel.json`.
 * @param sourceDirectories Directories whose `.ts`, `.md`, `.html`, `.js`, and `.mjs` files name icons.
 * @returns Vite plugin for client builds and the dev server.
 */
export function iconAssets(sourceDirectories: string[]): Plugin {
  const local = new LocalIconSets();
  let base = "/";
  let isClientBuild = false;

  return {
    name: "portfolio-icon-assets",
    configResolved(config) {
      base = config.base;
      isClientBuild = config.command === "build" && !config.build.ssr;
    },
    async buildStart() {
      if (!isClientBuild) return;
      const names = new Set<string>();
      const pattern = new RegExp(`\\b(?:${LOCAL_ICON_COLLECTIONS.join("|")}):[a-z0-9-]+`, "g");
      for (const directory of sourceDirectories) {
        for await (const file of glob("**/*.{ts,md,html,js,mjs}", { cwd: directory, exclude: ["**/node_modules/**"] })) {
          const content = await readFile(resolve(directory, file), "utf8");
          for (const match of content.matchAll(pattern)) names.add(match[0]);
        }
      }
      for (const name of [...names].sort()) {
        const svg = await local.get(name);
        // Matches such as `ri:` in prose are not icons; skip them silently.
        if (svg) this.emitFile({ type: "asset", fileName: `${ICON_ASSET_PATH}${name}.svg`, source: svg });
      }
    },
    configureServer(server) {
      const prefix = `${base}${ICON_ASSET_PATH}`;
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
        if (!pathname.startsWith(prefix)) return next();
        const name = pathname.slice(prefix.length).replace(/\.svg$/, "");
        if (!ICON_NAME_PATTERN.test(name) || !pathname.endsWith(".svg")) {
          response.writeHead(400).end();
          return;
        }
        let svg = await local.get(name);
        if (!svg) {
          const upstream = await fetch(`https://api.iconify.design/${name}.svg`).catch(() => null);
          svg = upstream?.ok ? await upstream.text() : null;
        }
        response
          .writeHead(svg ? 200 : 503, { "content-type": svg ? "image/svg+xml" : "text/plain" })
          .end(svg ?? "Icon unavailable");
      });
    },
  };
}
