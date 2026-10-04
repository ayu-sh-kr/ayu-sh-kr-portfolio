import "reflect-metadata";
import { expect, it } from "vitest";
import { UiIsometricShowcaseComponent } from "./ui-isometric-showcase.component.ts";

it("keeps the showcase interactive without replacing focused controls", () => {
  if (!customElements.get("ui-isometric-showcase")) customElements.define("ui-isometric-showcase", UiIsometricShowcaseComponent);
  const host = document.createElement("ui-isometric-showcase");
  document.body.append(host);
  try {
    const button = host.querySelector<HTMLButtonElement>("button")!;
    button.focus();
    const firstScene = host.querySelector("svg");
    button.click();
    expect(host.querySelector("svg")).not.toBe(firstScene);
    expect(host.querySelector("svg")?.classList.contains("is-playing")).toBe(true);
    expect(host.textContent).toContain("3. Store");
    expect(document.activeElement).toBe(button);
    const nextScene = host.querySelector("svg");
    button.click();
    expect(host.querySelector("svg")).not.toBe(nextScene);
  } finally {
    host.remove();
  }
});
