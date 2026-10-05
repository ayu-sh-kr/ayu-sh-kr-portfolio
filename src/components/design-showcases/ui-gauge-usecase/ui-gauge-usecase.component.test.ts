import "reflect-metadata";
import { expect, it } from "vitest";
import { UiGaugeUsecaseComponent } from "./ui-gauge-usecase.component.ts";

it.each(["energy", "audio", "thermostat", "unknown"])("renders the %s use case with native SVG and no controls", (example) => {
  if (!customElements.get("ui-gauge-usecase")) customElements.define("ui-gauge-usecase", UiGaugeUsecaseComponent);
  const host = document.createElement("ui-gauge-usecase");
  host.setAttribute("example", example);
  document.body.append(host);
  try {
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelectorAll("button, input")).toHaveLength(0);
    if (example === "thermostat") {
      expect(host.textContent).toContain("Target temperature");
      expect(host.textContent).toContain("Room is 19°");
      expect(host.querySelectorAll(".ui-thermostat-ticks line")).toHaveLength(41);
    } else if (example === "audio") {
      expect(host.querySelectorAll(".ui-usecase-meter-ticks line")).toHaveLength(34);
      expect(host.querySelector("line")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
      expect(host.textContent).toContain("STEREO INPUT");
    } else {
      expect(host.textContent).toContain("72%");
      expect(host.querySelector(".ui-usecase-energy-arc")?.getAttribute("stroke-dasharray")).toBe("316.67 439.82");
    }
  } finally {
    host.remove();
  }
});
