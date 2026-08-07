import {render} from "@ayu-sh-kr/dota-wrap/core";
import type {DotaRuntimePlugin} from "@ayu-sh-kr/dota-wrap";

/**
 * Adopts the DOM emitted by SSG before the client router starts its first
 * transition. Later route-created elements use the ordinary renderer.
 */
export const preserveInitialStaticRoute: DotaRuntimePlugin = {
  name: "preserve-initial-static-route",

  setup(context): void {
    const staticHosts = new WeakSet<object>();
    if (!import.meta.env.SSR) {
      document.querySelectorAll<HTMLElement>("#app-root, #app-root *")
        .forEach((element) => staticHosts.add(element));
    }

    const adoptedHosts = new WeakSet<object>();
    const normalizePath = (path: string): string => path.replace(/\/+$/, "") || "/";
    type MountStrategy = Parameters<typeof context.setMountStrategy>[0];
    type MountRoot = Parameters<MountStrategy>[1];
    type MountOutput = Parameters<MountStrategy>[2];
    type MountInstance = ReturnType<MountStrategy>;

    const renderNormally = (root: MountRoot, output: MountOutput): MountInstance =>
      render(root, output as never) as unknown as MountInstance;

    context.setMountStrategy((host, root, output) => {
      if (import.meta.env.SSR || !staticHosts.has(host) || adoptedHosts.has(host)) {
        return renderNormally(root, output);
      }

      adoptedHosts.add(host);
      let renderer: MountInstance | null = null;

      return {
        get output() {
          return renderer?.output ?? output;
        },
        update(nextOutput) {
          if (renderer) {
            return renderer.update(nextOutput);
          }

          renderer = renderNormally(root, nextOutput);
          return {kind: "mount", changedParts: 0, replacedNodes: 1};
        },
        dispose() {
          renderer?.dispose();
        },
      };
    });

    context.wrapRouteRenderer((next) => (_match, navigationContext) => {
      const rootElement = document.getElementById("app-root");
      const currentPage = rootElement?.querySelector<HTMLElement>("[path]")
        ?? document.querySelector<HTMLElement>("[path]");

      if (currentPage && normalizePath(currentPage.getAttribute("path") ?? "") === normalizePath(navigationContext.url.pathname)) {
        return;
      }

      return next(_match, navigationContext);
    });
  },
};
