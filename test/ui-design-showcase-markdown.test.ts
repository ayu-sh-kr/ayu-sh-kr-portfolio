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

const selector = "ui-skeuomorphic-showcase, ui-gauge-usecase, ui-isometric-showcase, ui-isometric-usecase, ui-motion-showcase";
const source = readFileSync("public/blogs/tutorial/ui-design-trends-skeuomorphism-isometric-glass.md", "utf8");

bootstrap([UiSkeuomorphicShowcaseComponent, UiGaugeUsecaseComponent, UiIsometricShowcaseComponent, UiIsometricUsecaseComponent, UiMotionShowcaseComponent]);
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
