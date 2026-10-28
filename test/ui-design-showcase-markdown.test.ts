import "reflect-metadata";
import { readFileSync, readdirSync } from "node:fs";
import { afterEach, expect, it } from "vitest";
import { MDService } from "@ayu-sh-kr/dota-md";
import { bootstrap, setMountStrategy } from "@ayu-sh-kr/dota-wrap/core";
import { hydrate, isTemplateResult, render, setHydrationEmit, templateId } from "@ayu-sh-kr/dota-wrap/rendering";
import { UiSkeuomorphicShowcaseComponent } from "../src/components/design-showcases/ui-skeuomorphic-showcase/ui-skeuomorphic-showcase.component.ts";
import { UiGaugeUsecaseComponent } from "../src/components/design-showcases/ui-gauge-usecase/ui-gauge-usecase.component.ts";
import { UiIsometricShowcaseComponent } from "../src/components/design-showcases/ui-isometric-showcase/ui-isometric-showcase.component.ts";
import { UiIsometricUsecaseComponent } from "../src/components/design-showcases/ui-isometric-usecase/ui-isometric-usecase.component.ts";
import { UiMotionShowcaseComponent } from "../src/components/design-showcases/ui-motion-showcase/ui-motion-showcase.component.ts";

import { UiAsciiShowcaseComponent } from "../src/components/design-showcases/ui-ascii-showcase/ui-ascii-showcase.component.ts";

const selector = "ui-ascii-showcase, ui-skeuomorphic-showcase, ui-gauge-usecase, ui-isometric-showcase, ui-isometric-usecase, ui-motion-showcase";
const source = readFileSync("public/blogs/tutorial/ui-design-trends-skeuomorphism-isometric-glass.md", "utf8");

bootstrap([UiAsciiShowcaseComponent, UiSkeuomorphicShowcaseComponent, UiGaugeUsecaseComponent, UiIsometricShowcaseComponent, UiIsometricUsecaseComponent, UiMotionShowcaseComponent]);
setMountStrategy((host, root, output) => {
  if (isTemplateResult(output) && host.getAttribute("data-dh-t") === templateId(output.strings)) {
    return hydrate(root, output, { mismatch: "throw" });
  }
  return render(root, output);
});

afterEach(() => {
  setHydrationEmit(false);
  document.body.replaceChildren();
});

it("does not wrap any authored block component in a Markdown paragraph", () => {
  const invalid: string[] = [];
  for (const path of readdirSync("public", { recursive: true })) {
    if (typeof path !== "string" || !path.endsWith(".md")) continue;
    const fragment = document.createElement("template");
    fragment.innerHTML = MDService.renderHtml(readFileSync(`public/${path}`, "utf8"));
    for (const host of fragment.content.querySelectorAll(`${selector}, showcase-metrics, showcase-aside`)) {
      if (host.closest("p")) invalid.push(`${path}: ${host.localName}`);
    }
  }
  expect(invalid).toEqual([]);
});

it("keeps all fifteen block showcases outside Markdown paragraphs before SSG and after client insertion", async () => {
  const article = document.createElement("article");
  article.innerHTML = MDService.renderHtml(source);
  const hosts = [...article.querySelectorAll(selector)];
  expect(hosts).toHaveLength(15);
  expect(hosts.map(host => host.closest("p")?.outerHTML ?? null)).toEqual(Array(15).fill(null));

  setHydrationEmit(true);
  document.body.append(article);
  await Promise.resolve();
  expect(article.querySelectorAll("figure")).toHaveLength(15);
  for (const host of hosts) expect(host.querySelectorAll(":scope > figure")).toHaveLength(1);
  const serialized = article.innerHTML;
  article.remove();

  setHydrationEmit(false);
  const clientArticle = document.createElement("article");
  document.body.append(clientArticle);
  clientArticle.innerHTML = serialized;
  await Promise.resolve();
  expect(clientArticle.querySelectorAll(selector)).toHaveLength(15);
  expect(clientArticle.querySelectorAll("figure")).toHaveLength(15);
  for (const host of clientArticle.querySelectorAll(selector)) {
    expect(host.closest("p")).toBeNull();
    expect(host.querySelectorAll(":scope > figure")).toHaveLength(1);
  }
});


it("keeps exactly one ASCII figure in the entire Dispatch article after serialization", async () => {
  const markdown = readFileSync("public/news/ascii-animation-web-design.md", "utf8");
  const article = document.createElement("article");
  article.innerHTML = MDService.renderHtml(markdown);
  expect(article.querySelector("ui-ascii-showcase")?.closest("p")).toBeNull();
  setHydrationEmit(true);
  document.body.append(article);
  await Promise.resolve();
  const serialized = article.innerHTML;
  article.remove();
  setHydrationEmit(false);
  const client = document.createElement("article");
  document.body.append(client);
  client.innerHTML = serialized;
  await Promise.resolve();
  expect(client.querySelectorAll("figure")).toHaveLength(1);
  expect(client.querySelectorAll("canvas")).toHaveLength(1);
  expect(client.querySelector("ui-ascii-showcase > figure")).not.toBeNull();
});
