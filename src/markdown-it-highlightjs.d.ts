/**
 * The package ships `types/core.d.ts` but its `core` entry has no export map, so the
 * bundler resolver finds `core.js` without a declaration. Re-point the subpath at the shipped types.
 */
declare module "markdown-it-highlightjs/core" {
  export * from "markdown-it-highlightjs/types/core";
  export { default } from "markdown-it-highlightjs/types/core";
}
