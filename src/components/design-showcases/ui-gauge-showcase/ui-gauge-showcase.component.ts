import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";

/** A compact cockpit illustration with three automatically moving analog instruments. */
@Component({ selector: "ui-gauge-showcase", shadow: false })
export class UiGaugeShowcaseComponent extends BaseElement {
  /** Builds complete SVG instruments so every tick retains its SVG namespace. */
  render() {
    const dials = ["SPEED", "HEADING", "ALTITUDE"].map((label, dial) => {
      const ticks = Array.from({ length: 49 }, (_, index) => {
        const angle = (index * 5 - 120) * Math.PI / 180;
        const inner = index % 4 === 0 ? 75 : 81;
        return `<line x1="${100 + Math.sin(angle) * inner}" y1="${100 - Math.cos(angle) * inner}" x2="${100 + Math.sin(angle) * 87}" y2="${100 - Math.cos(angle) * 87}" />`;
      }).join("");
      const numbers = Array.from({ length: 7 }, (_, index) => {
        const angle = (index * 40 - 120) * Math.PI / 180;
        return `<text x="${100 + Math.sin(angle) * 63}" y="${104 - Math.cos(angle) * 63}">${index * (dial === 2 ? 2 : 20)}</text>`;
      }).join("");
      return `<svg viewBox="0 0 200 200" aria-hidden="true" class="ui-gauge-dial ui-gauge-dial-${dial}">
        <circle class="ui-gauge-bezel" cx="100" cy="100" r="97" />
        <circle class="ui-gauge-face" cx="100" cy="100" r="90" />
        <g class="ui-gauge-ticks">${ticks}</g>
        <g class="ui-gauge-numbers">${numbers}</g>
        <text class="ui-gauge-unit" x="100" y="132">${label}</text>
        <g class="ui-gauge-pointer"><path d="M98 120 L100 35 L102 120 Z" /><circle cx="100" cy="100" r="5" /></g>
        <circle class="ui-gauge-pin" cx="100" cy="100" r="2" />
      </svg>`;
    }).join("");
    return html`<figure class="ui-gauge-specimen" role="img" aria-label="Three analog cockpit instruments with gently moving needles. Illustrative readings.">${trustedHTML(dials)}</figure>`;
  }
}
