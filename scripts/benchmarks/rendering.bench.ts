import "reflect-metadata";
import {writeFileSync} from "node:fs";
import {it} from "vitest";
import {hydrate, isTemplateResult, render, setHydrationEmit, update} from "@ayu-sh-kr/dota-wrap/rendering";
import {HomePage} from "@app/pages/home.page.ts";
import {AppHeaderComponent} from "@app/components/utils/header/app-header/app-header.component.ts";
import {BlogListComponent} from "@app/components/pages/blog/index/archive/blog-list/blog-list.component.ts";
import {NewsIndexComponent} from "@app/components/pages/news/index/news-index/news-index.component.ts";
import {DesignIndexReferenceComponent} from "@app/components/pages/design/index/reference/design-index-reference/design-index-reference.component.ts";
import {ActionButtonComponent} from "@app/components/utils/action-button/action-button.component.ts";

/** Renderer-only timing: excludes parsing the initial document, app boot, network, and layout. */
it("compares adoption, unchanged updates, and scalar patches", () => {
  const cases = [HomePage, AppHeaderComponent, BlogListComponent, NewsIndexComponent, DesignIndexReferenceComponent, ActionButtonComponent];
  const results: unknown[] = [];
  for (const Component of cases) {
    customElements.define(`bench-${Component.name.toLowerCase()}`, Component);
    const component = new Component();
    setHydrationEmit(true);
    const server = document.createElement("div");
    const serverView = render(server, component.render());
    setHydrationEmit(false);
    const mountTimes: number[] = [];
    const updateTimes: number[] = [];
    let retained = 0;
    let total = 0;
    for (let sample = -3; sample < 10; sample++) {
      const root = server.cloneNode(true) as HTMLElement;
      const oldElements = [...root.querySelectorAll("*")];
      const output = component.render();
      const start = performance.now();
      // Matches dota-ssr's normal component adoption/fallback, excluding route handoff.
      const view = isTemplateResult(output) ? hydrate(root, output, {mismatch: "throw"}) : render(root, output);
      const elapsed = performance.now() - start;
      const nextOutput = component.render();
      const updateStart = performance.now();
      update(view, nextOutput);
      const updateElapsed = performance.now() - updateStart;
      if (sample >= 0) {
        mountTimes.push(elapsed);
        updateTimes.push(updateElapsed);
        retained += oldElements.filter((element) => root.contains(element)).length;
        total += oldElements.length;
      }
      view.dispose();
      root.replaceChildren();
    }
    serverView.dispose();
    results.push({component: Component.name, mountMs: mountTimes, unchangedUpdateMs: updateTimes, retainedElements: retained, serverElements: total});
  }
  const action = new ActionButtonComponent();
  action.action = "benchmark";
  action.id = "benchmark-action";
  const root = document.createElement("div");
  const view = render(root, action.render());
  const button = root.querySelector("button");
  const changedTimes: number[] = [];
  let retainedButtons = 0;
  for (let sample = -20; sample < 200; sample++) {
    action.label = `Label ${sample}`;
    const start = performance.now();
    update(view, action.render());
    const elapsed = performance.now() - start;
    if (sample >= 0) {
      changedTimes.push(elapsed);
      if (root.querySelector("button") === button) retainedButtons++;
    }
  }
  view.dispose();
  writeFileSync(process.env.BENCH_OUTPUT ?? "/tmp/rendering-benchmark.json", JSON.stringify({runtime: process.version, cases: results, scalarUpdateMs: changedTimes, retainedButtons, scalarUpdates: changedTimes.length}, null, 2));
});
