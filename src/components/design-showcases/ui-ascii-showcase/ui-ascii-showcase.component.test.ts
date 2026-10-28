import "reflect-metadata";
import { expect, it } from "vitest";
import { UiAsciiShowcaseComponent } from "./ui-ascii-showcase.component.ts";

it("keeps one accessible woodland canvas after reconnect with no playback controls", async () => {
  if (!customElements.get("ui-ascii-showcase")) customElements.define("ui-ascii-showcase", UiAsciiShowcaseComponent);
  const host = document.createElement("ui-ascii-showcase");
  document.body.append(host);
  await Promise.resolve();
  expect(host.querySelectorAll("figure")).toHaveLength(1);
  expect(host.querySelectorAll("canvas")).toHaveLength(1);
  expect(host.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("third bird");
  expect(host.querySelector('input, button, pre')).toBeNull();
  const canvas = host.querySelector("canvas");
  host.remove();
  document.body.append(host);
  await Promise.resolve();
  expect(host.querySelectorAll("figure")).toHaveLength(1);
  expect(host.querySelector("canvas")).toBe(canvas);
  host.remove();
});
