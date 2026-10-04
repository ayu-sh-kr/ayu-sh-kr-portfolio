import "reflect-metadata";
import { expect, it } from "vitest";
import { UiGaugeShowcaseComponent } from "./ui-gauge-showcase.component.ts";

it("renders three complete SVG dials without duplicate controls or missing scale marks", () => {
  if (!customElements.get("ui-gauge-showcase")) customElements.define("ui-gauge-showcase", UiGaugeShowcaseComponent);
  const host = document.createElement("ui-gauge-showcase");
  document.body.append(host);
  try {
    expect(host.querySelectorAll("svg")).toHaveLength(3);
    expect(host.querySelectorAll(".ui-gauge-ticks line")).toHaveLength(147);
    expect(host.querySelector("line")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.querySelectorAll("button, input, figcaption")).toHaveLength(0);
  } finally {
    host.remove();
  }
});
