import { Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";
import { ArticleShowcaseElement } from "../article-showcase.element.ts";

/**
 * Three different physical metaphors: a record player, flip clock and project folder.
 * Used throughout the skeuomorphism article. Optional motion illustrates playback,
 * a minute changing, or a folder preview; the figures do not control real devices.
 */
@Component({ selector: "ui-skeuomorphic-showcase", shadow: false })
export class UiSkeuomorphicShowcaseComponent extends ArticleShowcaseElement {
  /** Attribute `example`: record (default), clock or folder; unknown values show record. */
  @Property({ name: "example", type: String })
  example = "record";

  /** Returns a complete authored SVG, with a readable static state for each study. */
  render() {
    const scenes = {
      record: `<svg viewBox="0 0 540 340" aria-hidden="true">
        <rect class="ui-physical-deck" x="22" y="29" width="496" height="281" rx="18" />
        <rect class="ui-physical-deck-inset" x="37" y="44" width="466" height="251" rx="12" />
        <circle class="ui-physical-platter" cx="182" cy="170" r="112" />
        <g class="ui-physical-vinyl-disc"><circle class="ui-physical-vinyl" cx="182" cy="170" r="104" />
          ${[94, 86, 78, 70, 62, 54].map(r => `<circle class="ui-physical-groove" cx="182" cy="170" r="${r}" />`).join("")}
          <path class="ui-physical-reflection" d="M111 99 A100 100 0 0 1 181 68 L181 129 A41 41 0 0 0 153 141 Z" />
          <circle class="ui-physical-label" cx="182" cy="170" r="37" /><path class="ui-physical-label-mark" d="M165 152 H199 M165 188 H199" /><circle class="ui-physical-spindle" cx="182" cy="170" r="4" />
        </g>
        <circle class="ui-physical-arm-mount" cx="407" cy="85" r="19" /><circle class="ui-physical-arm-inner" cx="407" cy="85" r="9" />
        <path class="ui-physical-arm-shadow" d="M407 87 L385 156 L271 199" /><path class="ui-physical-arm" d="M407 85 L382 152 L267 193" />
        <path class="ui-physical-cartridge" d="M250 192 l23 -10 10 15 -26 10 Z" />
        <text class="ui-physical-track" x="332" y="227">Night walk</text><text class="ui-physical-byline" x="332" y="250">Lena Park</text>
        <text class="ui-physical-record-time" x="332" y="278">02:18 / 04:32</text>
        <circle class="ui-physical-power" cx="58" cy="274" r="4" />
      </svg>`,
      clock: `<svg viewBox="0 0 540 290" aria-hidden="true">
        <text class="ui-physical-clock-title" x="270" y="32">Desk clock</text>
        <rect class="ui-physical-clock-body" x="60" y="57" width="420" height="172" rx="22" />
        <rect class="ui-physical-clock-face" x="77" y="74" width="176" height="138" rx="9" /><rect class="ui-physical-clock-face" x="287" y="74" width="176" height="138" rx="9" />
        <text class="ui-physical-clock-digit" x="165" y="186">09</text>
        <g class="ui-physical-clock-old"><text class="ui-physical-clock-digit" x="375" y="186">41</text></g>
        <g class="ui-physical-clock-new"><text class="ui-physical-clock-digit" x="375" y="186">42</text></g>
        <path class="ui-physical-clock-seam" d="M78 145 H252 M288 145 H462" />
        <g class="ui-physical-clock-hinges"><rect x="74" y="139" width="8" height="12" rx="2" /><rect x="248" y="139" width="8" height="12" rx="2" /><rect x="284" y="139" width="8" height="12" rx="2" /><rect x="458" y="139" width="8" height="12" rx="2" /></g>
        <path class="ui-physical-clock-feet" d="M98 229 v10 M442 229 v10" />
        <text class="ui-physical-clock-subtitle" x="270" y="269">24-hour time</text>
      </svg>`,
      folder: `<svg viewBox="0 0 540 330" aria-hidden="true">
        <text class="ui-physical-folder-title" x="270" y="32">Project files</text>
        <path class="ui-physical-folder-back" d="M107 119 V88 q0 -10 10 -10 h110 l24 24 h173 q10 0 10 10 v151 H107 Z" />
        <g class="ui-physical-folder-pages"><g transform="rotate(-7 203 173)"><rect class="ui-physical-paper" x="135" y="97" width="139" height="157" rx="4" /><text class="ui-physical-paper-title" x="150" y="131">Aa</text><path class="ui-physical-paper-lines" d="M150 149 h106 M150 165 h86 M150 181 h95" /></g>
          <g transform="rotate(6 329 173)"><rect class="ui-physical-paper" x="259" y="92" width="139" height="163" rx="4" /><rect class="ui-physical-swatch" x="275" y="108" width="47" height="45" rx="3" /><rect class="ui-physical-swatch-light" x="334" y="108" width="47" height="45" rx="3" /><path class="ui-physical-paper-lines" d="M275 174 h106 M275 190 h83" /></g>
        </g>
        <path class="ui-physical-folder-front" d="M96 160 q0 -11 11 -11 h327 q11 0 9 11 l-19 99 q-2 12 -14 12 H130 q-12 0 -14 -12 Z" />
        <text class="ui-physical-folder-name" x="270" y="211">Brand assets</text><text class="ui-physical-folder-count" x="270" y="239">3 files</text>
        <path class="ui-physical-folder-stitch" d="M130 257 H412" />
      </svg>`
    };
    const descriptions = {
      record: "Illustrative music player shaped like a record deck: a grooved vinyl record turns beneath a tonearm, with track title and playback time.",
      clock: "Illustrative desk flip clock: the minute changes from 09:41 to 09:42, with split faces and visible hinges.",
      folder: "Illustrative project folder: typography and colour sheets peek out of Brand assets, which contains three files."
    };
    const example = Object.hasOwn(scenes, this.example) ? this.example as keyof typeof scenes : "record";
    return html`<figure class="ui-physical-showcase ui-physical-${example}" role="img" aria-label="${descriptions[example]}">${trustedHTML(scenes[example])}</figure>`;
  }
}
