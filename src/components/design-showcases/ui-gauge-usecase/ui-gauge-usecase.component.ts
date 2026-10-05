import { BaseElement, Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";

/** Practical gauge treatments for an energy dashboard and a stereo recording interface. */
@Component({ selector: "ui-gauge-usecase", shadow: false })
export class UiGaugeUsecaseComponent extends BaseElement {
  /** Selects the authored example; unknown values use the home energy treatment. */
  @Property({ name: "example", type: String })
  example = "energy";

  /** Renders illustrative values with no controls or additional navigation. */
  render() {
    const audio = this.example === "audio";
    const meters = ["L", "R"].map((channel, index) => {
      const ticks = Array.from({ length: 17 }, (_, tick) => {
        const angle = (tick * 6 - 48) * Math.PI / 180;
        return `<line x1="${110 + Math.sin(angle) * 77}" y1="${126 - Math.cos(angle) * 77}" x2="${110 + Math.sin(angle) * (tick % 4 === 0 ? 90 : 85)}" y2="${126 - Math.cos(angle) * (tick % 4 === 0 ? 90 : 85)}" />`;
      }).join("");
      return `<g transform="translate(${index * 240 + 30} 28)"><rect class="ui-usecase-meter-face" width="220" height="152" rx="12" /><g class="ui-usecase-meter-ticks">${ticks}</g><text x="47" y="93">−20</text><text x="111" y="63">−6</text><text x="171" y="93">0</text><g class="ui-usecase-audio-pointer ui-usecase-audio-pointer-${index}"><path d="M108 129 L110 40 L112 129 Z" /><circle cx="110" cy="126" r="4" /></g><text class="ui-usecase-channel" x="110" y="145">${channel}</text></g>`;
    }).join("");
    const audioSvg = `<svg viewBox="0 0 540 228" aria-hidden="true">${meters}<text class="ui-usecase-audio-label" x="270" y="210">STEREO INPUT · dB</text></svg>`;
    const energySvg = `<svg viewBox="0 0 540 260" aria-hidden="true">
      <g class="ui-usecase-energy-icons"><circle cx="87" cy="81" r="15" /><path class="ui-usecase-rays" d="M87 52 v-8 M87 110 v8 M58 81 h-8 M116 81 h8 M67 61 l-6 -6 M107 101 l6 6 M67 101 l-6 6 M107 61 l6 -6" /><path d="M433 57 l-27 22 v34 h54 V79 Z M424 113 V92 h17 v21" /></g>
      <path class="ui-usecase-energy-flow" d="M122 81 H179 M361 81 H397" />
      <circle class="ui-usecase-energy-track" cx="270" cy="106" r="70" />
      <circle class="ui-usecase-energy-arc" cx="270" cy="106" r="70" stroke-dasharray="316.67 439.82" transform="rotate(-90 270 106)" />
      <text class="ui-usecase-energy-value" x="270" y="112">72%</text><text x="270" y="138">used at home</text>
      <text x="87" y="149">Solar</text><text x="433" y="149">Home</text><text class="ui-usecase-energy-label" x="270" y="222">Solar energy used at home today</text>
    </svg>`;
    return html`<figure class="ui-gauge-usecase ${audio ? "ui-gauge-usecase-audio" : "ui-gauge-usecase-energy"}" role="img" aria-label="${audio ? "Illustrative stereo input meters with automatically moving needles." : "Illustrative home energy dashboard: 72 percent of today's solar generation used at home."}">${trustedHTML(audio ? audioSvg : energySvg)}</figure>`;
  }
}
