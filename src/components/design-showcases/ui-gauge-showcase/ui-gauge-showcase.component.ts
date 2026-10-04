import { BaseElement, BindEvent, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";

/** A keyboard-adjustable instrument specimen embedded directly in trusted blog Markdown. */
@Component({ selector: "ui-gauge-showcase", shadow: false })
export class UiGaugeShowcaseComponent extends BaseElement {
  /** Updates only the needle and readout, preserving slider focus during dragging. */
  @BindEvent({ event: "input", id: "[data-gauge-input]" })
  adjustGauge(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.querySelector<SVGElement>("[data-gauge-needle]")?.setAttribute("transform", `rotate(${value * 2.4 - 120} 150 150)`);
    const output = this.querySelector("output");
    if (output) output.textContent = `${value}% capacity`;
    const reading = this.querySelector("[data-gauge-reading]");
    if (reading) reading.textContent = `${value}%`;
  }

  /** Creates a fixed 0–100 scale whose position remains comparable across updates. */
  render() {
    const ticks = Array.from({ length: 21 }, (_, index) => `<line x1="150" y1="43" x2="150" y2="${index % 5 === 0 ? 59 : 51}" transform="rotate(${index * 12 - 120} 150 150)" />`).join("");
    return html`
      <figure class="ui-gauge-specimen">
        <div class="ui-gauge-face">
          <svg viewBox="0 0 300 300" role="img" aria-label="Analog capacity dial, from zero to one hundred percent">
            <circle class="ui-gauge-rim" cx="150" cy="150" r="139" />
            <circle class="ui-gauge-plate" cx="150" cy="150" r="122" />
            <g class="ui-gauge-ticks">${trustedHTML(ticks)}</g>
            <text x="58" y="220">0</text><text x="150" y="78">50</text><text x="242" y="220">100</text>
            <g data-gauge-needle transform="rotate(24 150 150)"><path class="ui-gauge-needle" d="M146 160 L150 62 L154 160 Z" /></g>
            <circle class="ui-gauge-hub" cx="150" cy="150" r="10" />
            <text class="ui-gauge-reading" data-gauge-reading x="150" y="207">60%</text>
            <text x="150" y="232">CAPACITY</text>
          </svg>
        </div>
        <label class="ui-gauge-control"><span>Adjust capacity</span><input data-gauge-input type="range" min="0" max="100" value="60" aria-label="Capacity percentage" /></label>
        <output>60% capacity</output>
        <figcaption>One value, one stable scale. The number stays readable without interpreting the needle.</figcaption>
      </figure>
    `;
  }
}
