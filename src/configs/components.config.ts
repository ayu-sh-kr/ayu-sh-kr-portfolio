import {defineComponentLoaders} from "@ayu-sh-kr/dota-wrap";

/** Loads Dota UI once; every tag below shares the same chunk. */
const ui = () => import("@ayu-sh-kr/dota-ui");

/** Loads Dota MD after the portfolio's Markdown setup, so it is configured before any view renders. */
const md = () => import("@app/configs/markdown.config.ts").then(() => import("@ayu-sh-kr/dota-md"));

/**
 * Library elements the portfolio renders, defined only when a route or the document needs them.
 * Application components come from `virtual:dota-component-registry`; register a library tag
 * here before using it in a template.
 */
export const libraryComponents = defineComponentLoaders({
  "dota-accordion": () => ui().then((module) => module.AccordionComponent),
  "dota-icon": () => ui().then((module) => {
    // Icons are emitted by the local-icons Vite plugin, so no request leaves the site.
    module.IconsComponent.baseUrl = `${import.meta.env.BASE_URL}assets/icons`;
    return module.IconsComponent;
  }),
  "dota-popover": () => ui().then((module) => module.PopoverComponent),
  "md-view": () => md().then((module) => module.MdViewComponent),
});
