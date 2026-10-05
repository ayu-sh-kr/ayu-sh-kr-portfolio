import "reflect-metadata";
import { expect, it } from "vitest";
import { UiSkeuomorphicShowcaseComponent } from "./ui-skeuomorphic-showcase.component.ts";

it.each(["record", "clock", "folder", "unknown"])("renders one %s physical metaphor without controls", async (example) => {
  if (!customElements.get("ui-skeuomorphic-showcase")) customElements.define("ui-skeuomorphic-showcase", UiSkeuomorphicShowcaseComponent);
  const host = document.createElement("ui-skeuomorphic-showcase");
  host.setAttribute("example", example);
  document.body.append(host);
  await Promise.resolve();
  try {
    expect(host.querySelectorAll("figure")).toHaveLength(1);
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelectorAll("button, input")).toHaveLength(0);
    expect(host.querySelector("path")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.textContent).toContain(example === "clock" ? "24-hour time" : example === "folder" ? "Brand assets" : "Night walk");
  } finally {
    host.remove();
  }
});
