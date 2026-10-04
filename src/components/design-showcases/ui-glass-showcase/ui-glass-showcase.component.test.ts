import "reflect-metadata";
import { expect, it } from "vitest";
import { UiGlassShowcaseComponent } from "./ui-glass-showcase.component.ts";

it("keeps the showcase interactive without replacing focused controls", () => {
  if (!customElements.get("ui-glass-showcase")) customElements.define("ui-glass-showcase", UiGlassShowcaseComponent);
  const host = document.createElement("ui-glass-showcase");
  document.body.append(host);
  try {
    const button = host.querySelector<HTMLButtonElement>("button")!;
    button.focus();
    button.click();
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(host.querySelector("[data-glass-panel]")?.classList.contains("is-solid")).toBe(true);
    expect(document.activeElement).toBe(button);
    button.click();
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(host.querySelector("[data-glass-panel]")?.classList.contains("is-solid")).toBe(false);
  } finally {
    host.remove();
  }
});
