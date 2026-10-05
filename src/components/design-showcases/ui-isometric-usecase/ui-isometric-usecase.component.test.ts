import "reflect-metadata";
import { expect, it } from "vitest";
import { UiIsometricUsecaseComponent } from "./ui-isometric-usecase.component.ts";

it.each(["images", "delivery", "backup", "unknown"])("renders the %s scene with matching process labels", async (example) => {
  if (!customElements.get("ui-isometric-usecase")) customElements.define("ui-isometric-usecase", UiIsometricUsecaseComponent);
  const host = document.createElement("ui-isometric-usecase");
  host.setAttribute("example", example);
  document.body.append(host);
  await Promise.resolve();
  try {
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelector("path")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.querySelectorAll("button, input")).toHaveLength(0);
    if (example === "backup") {
      expect(host.textContent).toContain("Original files");
      expect(host.textContent).toContain("Backup archive");
      expect(host.querySelector(".ui-backup-transfer")).not.toBeNull();
      return;
    }
    if (example === "delivery") {
      expect(host.querySelectorAll(".ui-delivery-opening")).toHaveLength(2);
      expect(host.querySelector(".ui-practical-parcel-in")).not.toBeNull();
      expect(host.querySelector(".ui-delivery-parcel-load")).not.toBeNull();
    }
    expect(host.textContent).toContain(example === "delivery" ? "Out for delivery" : "Original photo");
    expect(host.querySelector(example === "delivery" ? ".ui-practical-wheel" : ".ui-practical-output")).not.toBeNull();
  } finally {
    host.remove();
  }
});
