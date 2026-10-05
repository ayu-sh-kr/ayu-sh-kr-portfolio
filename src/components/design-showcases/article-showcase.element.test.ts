import "reflect-metadata";
import { afterEach, expect, it } from "vitest";
import { setMountStrategy } from "@ayu-sh-kr/dota-wrap/core";
import { hydrate, isTemplateResult, render, setHydrationEmit, templateId } from "@ayu-sh-kr/dota-wrap/rendering";
import { UiGaugeUsecaseComponent } from "./ui-gauge-usecase/ui-gauge-usecase.component.ts";
import { UiIsometricShowcaseComponent } from "./ui-isometric-showcase/ui-isometric-showcase.component.ts";
import { UiMotionShowcaseComponent } from "./ui-motion-showcase/ui-motion-showcase.component.ts";
import { UiSkeuomorphicShowcaseComponent } from "./ui-skeuomorphic-showcase/ui-skeuomorphic-showcase.component.ts";

  setMountStrategy((host, root, output) => {
    if (isTemplateResult(output) && host.getAttribute("data-dh-t") === templateId(output.strings)) {
      return hydrate(root, output, { mismatch: "throw" });
    }
    return render(root, output);
  });

const scenes = [
  ["ui-gauge-usecase", UiGaugeUsecaseComponent],
  ["ui-isometric-showcase", UiIsometricShowcaseComponent],
  ["ui-motion-showcase", UiMotionShowcaseComponent],
  ["ui-skeuomorphic-showcase", UiSkeuomorphicShowcaseComponent],
] as const;

afterEach(() => {
  setHydrationEmit(false);
  document.body.replaceChildren();
});

it("waits for the initial document parser before mounting a serialized showcase", async () => {
  const name = "ui-skeuomorphic-showcase";
  if (!customElements.get(name)) customElements.define(name, UiSkeuomorphicShowcaseComponent);
  setHydrationEmit(true);
  const serverHost = document.createElement(name);
  serverHost.setAttribute("example", "record");
  document.body.append(serverHost);
  await Promise.resolve();
  const serialized = serverHost.outerHTML;
  serverHost.remove();
  setHydrationEmit(false);

  const readyState = Object.getOwnPropertyDescriptor(document, "readyState");
  Object.defineProperty(document, "readyState", { configurable: true, value: "loading" });
  try {
    const container = document.createElement("div");
    document.body.append(container);
    container.innerHTML = serialized;
    const host = container.firstElementChild!;
    const originalFigure = host.querySelector("figure");
    await Promise.resolve();
    expect(host.querySelectorAll("figure")).toHaveLength(1);
    expect(host.querySelector("figure")).toBe(originalFigure);

    document.dispatchEvent(new Event("DOMContentLoaded"));
    await Promise.resolve();
    expect(host.querySelectorAll("figure")).toHaveLength(1);
    expect(host.querySelector("figure")).toBe(originalFigure);
  } finally {
    if (readyState) Object.defineProperty(document, "readyState", readyState);
    else Reflect.deleteProperty(document, "readyState");
  }
});

it("preserves a server figure even if its hydration template marker differs", async () => {
  const name = "ui-skeuomorphic-showcase";
  if (!customElements.get(name)) customElements.define(name, UiSkeuomorphicShowcaseComponent);
  setHydrationEmit(true);
  const serverHost = document.createElement(name);
  document.body.append(serverHost);
  await Promise.resolve();
  const serialized = serverHost.outerHTML.replace(/data-dh-t="[^"]+"/, 'data-dh-t="outdated-template"');
  serverHost.remove();
  setHydrationEmit(false);

  const container = document.createElement("div");
  document.body.append(container);
  container.innerHTML = serialized;
  await Promise.resolve();
  const host = container.firstElementChild!;
  expect(host.querySelectorAll("figure")).toHaveLength(1);
  expect(host.querySelector("figure")?.getAttribute("role")).toBe("img");
});

it.each(scenes)("keeps one figure when serialized %s is inserted into a live Markdown container", async (name, component) => {
  if (!customElements.get(name)) customElements.define(name, component);
  setHydrationEmit(true);
  const serverHost = document.createElement(name);
  document.body.append(serverHost);
  await Promise.resolve();
  const serialized = serverHost.outerHTML;
  serverHost.remove();
  setHydrationEmit(false);
  const container = document.createElement("div");
  document.body.append(container);
  container.innerHTML = serialized;
  await Promise.resolve();
  const host = container.firstElementChild!;
  expect(host.querySelectorAll("figure")).toHaveLength(1);
  const figure = host.querySelector("figure");
  host.remove();
  document.body.append(host);
  await Promise.resolve();
  expect(host.querySelectorAll("figure")).toHaveLength(1);
  expect(host.querySelector("figure")).toBe(figure);
});
