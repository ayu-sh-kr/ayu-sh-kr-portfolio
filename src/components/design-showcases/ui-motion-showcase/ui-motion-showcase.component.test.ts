import "reflect-metadata";
import { expect, it } from "vitest";
import { UiMotionShowcaseComponent } from "./ui-motion-showcase.component.ts";

it.each(["save", "expand", "reorder", "cart", "sheet", "unknown"])("renders the %s motion study with accessible context and no controls", async (example) => {
  if (!customElements.get("ui-motion-showcase")) customElements.define("ui-motion-showcase", UiMotionShowcaseComponent);
  const host = document.createElement("ui-motion-showcase");
  host.setAttribute("example", example);
  document.body.append(host);
  await Promise.resolve();
  try {
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelector("rect")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.querySelectorAll("button, input, a")).toHaveLength(0);
    expect(host.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("Illustrative");
    if (example === "reorder") {
      expect(host.textContent).toContain("Playing now");
      expect(host.textContent).toContain("Play next");
    } else if (example === "expand") expect(host.textContent).toContain("Lakeside walks");
    else if (example === "cart") expect(host.textContent).toContain("1 sage mug in your bag");
    else if (example === "sheet") {
      expect(host.textContent).toContain("8 min walk");
      expect(host.querySelector("clipPath")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    } else expect(host.textContent).toContain("Ready to share");
  } finally {
    host.remove();
  }
});
