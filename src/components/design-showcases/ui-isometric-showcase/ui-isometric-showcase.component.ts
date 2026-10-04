import { BaseElement, BindEvent, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";

/** Shows a small process in a consistent projection; motion runs once only on request. */
@Component({ selector: "ui-isometric-showcase", shadow: false })
export class UiIsometricShowcaseComponent extends BaseElement {
  /** Replaces the illustrated scene to restart its finite CSS animation without timers. */
  @BindEvent({ event: "click", id: "[data-isometric-replay]" })
  replayProcess(): void {
    const scene = this.querySelector<SVGElement>("svg");
    if (!scene) return;
    const replacement = scene.cloneNode(true) as SVGElement;
    replacement.classList.add("is-playing");
    scene.replaceWith(replacement);
  }

  /** Renders the same three stages as text and geometry, including a static motion fallback. */
  render() {
    return html`
      <figure class="ui-isometric-specimen">
        <svg viewBox="0 0 620 330" role="img" aria-label="A request enters a processor, then a result is stored">
          <g class="ui-isometric-path"><path d="M90 180 L245 90 L510 243" /><path d="M110 192 L245 114 L490 255" /></g>
          <g class="ui-isometric-machine">
            <path class="ui-isometric-top" d="M210 118 L290 72 L370 118 L290 164 Z" />
            <path class="ui-isometric-left" d="M210 118 L290 164 L290 244 L210 198 Z" />
            <path class="ui-isometric-right" d="M290 164 L370 118 L370 198 L290 244 Z" />
            <path class="ui-isometric-detail" d="M228 160 L270 184 M228 175 L270 199 M309 192 L349 169" />
            <path class="ui-isometric-chip" d="M265 118 L290 104 L315 118 L290 132 Z" />
          </g>
          <g class="ui-isometric-packet"><path d="M102 175 L122 163 L142 175 L122 187 Z" /></g>
          <g class="ui-isometric-result"><path class="ui-isometric-top" d="M449 238 L485 217 L521 238 L485 259 Z" /><path class="ui-isometric-left" d="M449 238 L485 259 L485 277 L449 256 Z" /><path class="ui-isometric-right" d="M485 259 L521 238 L521 256 L485 277 Z" /></g>
          <g class="ui-isometric-labels"><text x="95" y="240">1. Request</text><text x="290" y="286">2. Process</text><text x="492" y="309">3. Store</text></g>
        </svg>
        <button data-isometric-replay type="button">Replay process</button>
        <figcaption>A single packet moves toward the processor; the stored result appears after it arrives. Reduced motion keeps all three stages visible.</figcaption>
      </figure>
    `;
  }
}
