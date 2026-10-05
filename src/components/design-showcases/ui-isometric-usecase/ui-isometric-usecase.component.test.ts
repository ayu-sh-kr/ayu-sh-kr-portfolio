import "reflect-metadata";
import { expect, it } from "vitest";
import { UiIsometricUsecaseComponent } from "./ui-isometric-usecase.component.ts";

it.each(["images", "delivery", "unknown"])("renders the %s scene with matching process labels", (example) => {
  if (!customElements.get("ui-isometric-usecase")) customElements.define("ui-isometric-usecase", UiIsometricUsecaseComponent);
  const host = document.createElement("ui-isometric-usecase");
  host.setAttribute("example", example);
  document.body.append(host);
  try {
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelector("path")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.querySelectorAll("button, input")).toHaveLength(0);
    expect(host.textContent).toContain(example === "delivery" ? "Send onward" : "Original image");
    expect(host.querySelector(example === "delivery" ? ".ui-practical-parcel-out" : ".ui-practical-output")).not.toBeNull();
  } finally {
    host.remove();
  }
});
