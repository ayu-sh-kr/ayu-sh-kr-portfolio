import "reflect-metadata";
import { expect, it } from "vitest";
import { UiMotionShowcaseComponent } from "./ui-motion-showcase.component.ts";

it.each(["save", "expand", "reorder", "unknown"])("renders the %s motion study with accessible context and no controls", (example) => {
  if (!customElements.get("ui-motion-showcase")) customElements.define("ui-motion-showcase", UiMotionShowcaseComponent);
  const host = document.createElement("ui-motion-showcase");
  host.setAttribute("example", example);
  document.body.append(host);
  try {
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelector("rect")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.querySelectorAll("button, input, a")).toHaveLength(0);
    expect(host.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("Illustrative");
    if (example === "reorder") expect(host.querySelectorAll(".ui-motion-row")).toHaveLength(3);
    else if (example === "expand") expect(host.textContent).toContain("Lake District");
    else expect(host.textContent).toContain("All changes saved");
  } finally {
    host.remove();
  }
});
