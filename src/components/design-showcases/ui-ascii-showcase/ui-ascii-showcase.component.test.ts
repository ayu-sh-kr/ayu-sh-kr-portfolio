import "reflect-metadata";
import { expect, it } from "vitest";
import { UiAsciiShowcaseComponent } from "./ui-ascii-showcase.component.ts";

it("keeps a single accessible study after reconnect and renders deterministic ASCII frames", async () => {
  if (!customElements.get("ui-ascii-showcase")) customElements.define("ui-ascii-showcase", UiAsciiShowcaseComponent);
  const host = document.createElement("ui-ascii-showcase");
  document.body.append(host);
  await Promise.resolve();
  const original = [...host.querySelectorAll("pre")].map(frame => frame.textContent);
  expect(original).toHaveLength(48);
  expect(new Set(original).size).toBeGreaterThan(1);
  expect(original.every(frame => /^[ .,:;irsx%#@\n]+$/.test(frame ?? ""))).toBe(true);
  expect(host.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("hummingbird");
  expect(host.querySelector('input, button')).toBeNull();
  host.remove();
  document.body.append(host);
  await Promise.resolve();
  expect(host.querySelectorAll("figure")).toHaveLength(1);
  expect([...host.querySelectorAll("pre")].map(frame => frame.textContent)).toEqual(original);
  host.remove();
});
