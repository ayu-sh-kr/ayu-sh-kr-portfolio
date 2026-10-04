import "reflect-metadata";
import { expect, it } from "vitest";
import { UiGaugeShowcaseComponent } from "./ui-gauge-showcase.component.ts";

it("keeps the showcase interactive without replacing focused controls", () => {
  if (!customElements.get("ui-gauge-showcase")) customElements.define("ui-gauge-showcase", UiGaugeShowcaseComponent);
  const host = document.createElement("ui-gauge-showcase");
  document.body.append(host);
  try {
    const input = host.querySelector<HTMLInputElement>("input")!;
    input.focus();
    input.value = "100";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(host.querySelector("output")?.textContent).toBe("100% capacity");
    expect(host.querySelector("[data-gauge-needle]")?.getAttribute("transform")).toBe("rotate(120 150 150)");
    expect(document.activeElement).toBe(input);
  } finally {
    host.remove();
  }
});
