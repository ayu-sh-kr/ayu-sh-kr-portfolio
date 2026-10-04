import "reflect-metadata";
import { expect, it } from "vitest";
import { UiIsometricShowcaseComponent } from "./ui-isometric-showcase.component.ts";

it("renders the conveyor scene with moving pieces and no replay controls", () => {
  if (!customElements.get("ui-isometric-showcase")) customElements.define("ui-isometric-showcase", UiIsometricShowcaseComponent);
  const host = document.createElement("ui-isometric-showcase");
  document.body.append(host);
  try {
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelectorAll(".ui-iso-item")).toHaveLength(2);
    expect(host.querySelectorAll(".ui-iso-belt-lines path")).toHaveLength(8);
    expect(host.querySelector(".ui-iso-belt-lines path")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.querySelectorAll("button, input, text, figcaption")).toHaveLength(0);
  } finally {
    host.remove();
  }
});
