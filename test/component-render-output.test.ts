import "reflect-metadata";
import {expect, it} from "vitest";
import {isTemplateResult, render} from "@ayu-sh-kr/dota-wrap/rendering";

const modules = import.meta.glob<Record<string, unknown>>([
  "../src/components/**/*.component.ts",
  "../src/pages/**/*.page.ts",
], {eager: true});

/** Exercises initial component states, including pages excluded from SSG. */
for (const [path, module] of Object.entries(modules)) {
  for (const value of Object.values(module)) {
    if (typeof value !== "function" || !(value.prototype instanceof HTMLElement)) continue;
    const Component = value as CustomElementConstructor;
    it(`renders structured markup without string artifacts: ${path}`, () => {
      const name = `test-render-${Component.name.toLowerCase()}`;
      if (!customElements.get(name)) customElements.define(name, Component);
      const component = new Component() as HTMLElement & {render(): unknown};
      const output = component.render();
      // Motion controllers deliberately own no DOM.
      if (output === "") return;
      expect(isTemplateResult(output)).toBe(true);
      const root = document.createElement("div");
      render(root, output as ReturnType<typeof import("@ayu-sh-kr/dota-wrap/rendering").html>);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.parentElement?.closest("pre, code, script, style, textarea")) continue;
        expect(node.textContent).not.toMatch(/\[object Object\]|<\/?(?:article|div|span|svg|a|button)(?:\s|>)/);
      }
    });
  }
}
