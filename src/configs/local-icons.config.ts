import {readFile, readdir} from "node:fs/promises";
import {createRequire} from "node:module";
import {join, resolve} from "node:path";
import {getIconData, iconToHTML, iconToSVG} from "@iconify/utils";
import type {Plugin} from "vite";

/** Icon set JSON as `@iconify/utils` reads it. */
type IconifyJSON = Parameters<typeof getIconData>[0];

/** Collections installed as `@iconify-json/*` packages; every `dota-icon` name must use one of these. */
const LOCAL_COLLECTIONS = ["lucide", "ri", "material-symbols", "mdi"] as const;

/** Public URL directory; `IconsComponent.baseUrl` in components.config.ts points here. */
const LOCAL_ICON_PATH = "/assets/icons";

const ICON_NAME = new RegExp(`\\b(?:${LOCAL_COLLECTIONS.join("|")}):[a-z0-9]+(?:-[a-z0-9]+)*`, "g");
const require = createRequire(import.meta.url);
const sets = new Map<string, Promise<IconifyJSON | null>>();

/** Loads one installed icon set once per process. */
function loadSet(prefix: string): Promise<IconifyJSON | null> {
  if (!(LOCAL_COLLECTIONS as readonly string[]).includes(prefix)) {
    return Promise.resolve(null);
  }
  let set = sets.get(prefix);
  if (!set) {
    set = readFile(require.resolve(`@iconify-json/${prefix}/icons.json`), "utf8")
      .then((text) => JSON.parse(text) as IconifyJSON)
      .catch(() => null);
    sets.set(prefix, set);
  }
  return set;
}

/**
 * Renders one icon from the installed sets.
 *
 * @param name - Iconify name such as `lucide:copy`.
 * @returns A standalone SVG matching the Iconify API output, or null when the icon is not installed.
 */
async function renderIcon(name: string): Promise<string | null> {
  const [prefix, icon] = name.split(":");
  const set = prefix && icon ? await loadSet(prefix) : null;
  const data = set && getIconData(set, icon);
  if (!data) {
    return null;
  }
  const {attributes, body} = iconToSVG(data, {height: "1em"});
  return iconToHTML(body, attributes);
}

/** Lists every source file under a directory whose extension is in `extensions`. */
async function listFiles(directory: string, extensions: string[]): Promise<string[]> {
  const entries = await readdir(directory, {withFileTypes: true, recursive: true}).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension)))
    .map((entry) => join(entry.parentPath, entry.name));
}

/**
 * Serves `dota-icon` SVGs from the site's own origin instead of `api.iconify.design`.
 *
 * Builds scan the portfolio sources and Dota UI for icon names in the installed collections and
 * emit each as `assets/icons/<name>.svg`; development renders the same files on request. Icons
 * come from `@iconify-json/*`, so neither builds nor visitors depend on the Iconify API.
 *
 * @param root - Project root containing `src`, `public` and `node_modules`.
 */
export function localIcons(root: string): Plugin {
  return {
    name: "local-icons",

    configureServer(server) {
      server.middlewares.use(LOCAL_ICON_PATH, async (request, response, next) => {
        const name = decodeURIComponent(request.url?.slice(1).replace(/\.svg(?:\?.*)?$/, "") ?? "");
        const svg = await renderIcon(name);
        if (!svg) {
          next();
          return;
        }
        response.writeHead(200, {"content-type": "image/svg+xml"}).end(svg);
      });
    },

    async generateBundle() {
      if (this.environment?.config.consumer === "server") {
        return;
      }
      const files = [
        ...await listFiles(resolve(root, "src"), [".ts", ".md", ".html"]),
        ...await listFiles(resolve(root, "public"), [".md", ".html"]),
        ...await listFiles(resolve(root, "node_modules/@ayu-sh-kr/dota-ui/dist"), [".mjs"]),
      ];
      const names = new Set<string>();
      for (const file of files) {
        for (const match of (await readFile(file, "utf8")).matchAll(ICON_NAME)) {
          names.add(match[0]);
        }
      }
      for (const name of [...names].sort()) {
        const svg = await renderIcon(name);
        if (!svg) {
          this.warn(`Icon ${name} is not in the installed @iconify-json sets.`);
          continue;
        }
        this.emitFile({type: "asset", fileName: `${LOCAL_ICON_PATH.slice(1)}/${name}.svg`, source: svg});
      }
    },
  };
}
