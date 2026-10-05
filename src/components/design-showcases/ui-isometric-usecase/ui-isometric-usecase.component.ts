import { ArticleShowcaseElement } from "../article-showcase.element.ts";
import { Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";

/** Isometric process studies for image resizing, parcel sorting and backup copies.
 * The article selects a scene; optional CSS animation follows its fixed drawing grid. */
@Component({ selector: "ui-isometric-usecase", shadow: false })
export class UiIsometricUsecaseComponent extends ArticleShowcaseElement {
  /** Attribute `example`: images (default), delivery or backup. Unknown values show images. */
  @Property({ name: "example", type: String })
  example = "images";

  /** Composes a complete SVG so the moving objects retain the shared drawing grid. */
  render() {
    if (this.example === "backup") {
      const svg = `<svg viewBox="0 0 560 330" aria-hidden="true">
        <path class="ui-practical-path" d="M137 192 L270 115 L415 199" />
        <g class="ui-practical-object">
          <path class="ui-practical-top" d="M50 189 L139 138 L215 182 L126 233 Z" />
          <path class="ui-practical-side" d="M50 189 L126 233 V245 L50 201 Z M126 233 L215 182 V194 L126 245 Z" />
          <path class="ui-practical-top" d="M87 130 L143 98 L190 125 L134 157 Z M87 145 L143 113 L190 140 L134 172 Z M87 160 L143 128 L190 155 L134 187 Z" />
          <path class="ui-practical-detail" d="M104 159 L137 140 M115 166 L149 147 M124 173 L158 154" />
          <path class="ui-practical-accent" d="M121 129 L146 115 L168 128 L143 142 Z" />
        </g>
        <g class="ui-practical-object">
          <path class="ui-practical-top" d="M241 101 L279 79 L317 101 L279 123 Z" />
          <path class="ui-practical-side" d="M241 101 L279 123 V167 L241 145 Z M279 123 L317 101 V145 L279 167 Z" />
          <path class="ui-practical-detail" d="M252 119 L268 128 M290 128 L306 119" />
          <path class="ui-backup-copy" d="M267 101 l8 5 14 -8" />
        </g>
        <g class="ui-practical-object">
          <path class="ui-practical-top" d="M366 149 L423 116 L480 149 L423 182 Z" />
          <path class="ui-practical-side" d="M366 149 L423 182 V254 L366 221 Z M423 182 L480 149 V221 L423 254 Z" />
          <path class="ui-practical-detail" d="M375 176 L413 198 M375 192 L413 214 M375 208 L413 230 M435 201 L470 181 M435 217 L470 197 M435 233 L470 213" />
          <path class="ui-practical-accent" d="M403 150 L423 138 L443 150 L423 162 Z" />
          <path class="ui-backup-copy" d="M398 149 l15 9 25 -15" />
        </g>
        <g class="ui-backup-transfer"><path class="ui-practical-accent" d="M154 184 l12 -7 12 7 -12 7 Z" /></g>
        <g class="ui-practical-labels"><text x="129" y="284">Original files</text><text x="279" y="206">Make a copy</text><text x="423" y="284">Backup archive</text></g>
      </svg>`;
      return html`<figure class="ui-isometric-usecase" role="img" aria-label="Illustrative backup service: original documents stay on their platform while a copy travels to a separate archive.">${trustedHTML(svg)}</figure>`;
    }
    const delivery = this.example === "delivery";
    const images = `<svg viewBox="0 0 560 280" aria-hidden="true">
      <path class="ui-practical-path" d="M112 132 L254 50 L432 153" />
      <g class="ui-practical-object ui-practical-image-source"><path class="ui-practical-top" d="M42 145 L116 102 L180 139 L106 182 Z" /><path class="ui-practical-side" d="M42 145 L106 182 L106 192 L42 155 Z M106 182 L180 139 L180 149 L106 192 Z" /><path class="ui-practical-picture" d="M69 146 L104 126 L151 153 L116 173 Z M76 148 L103 149 L103 139 L139 154" /><ellipse class="ui-practical-accent" cx="112" cy="142" rx="5" ry="3" /></g>
      <g class="ui-practical-object"><path class="ui-practical-top" d="M209 98 L265 66 L321 98 L265 130 Z" /><path class="ui-practical-side" d="M209 98 L265 130 L265 188 L209 156 Z M265 130 L321 98 L321 156 L265 188 Z" /><path class="ui-practical-detail" d="M223 135 L251 151 M279 151 L307 135" /><path class="ui-practical-accent" d="M247 98 L265 88 L283 98 L265 108 Z" /></g>
      <g class="ui-practical-object ui-practical-output"><path class="ui-practical-top" d="M372 166 L407 146 L441 166 L406 186 Z M404 192 L437 173 L469 192 L436 211 Z M445 151 L469 137 L493 151 L469 165 Z" /><path class="ui-practical-side" d="M372 166 L406 186 L441 166 V172 L406 192 L372 172 Z M404 192 L436 211 L469 192 V198 L436 217 L404 198 Z M445 151 L469 165 L493 151 V157 L469 171 L445 157 Z" /><path class="ui-practical-picture" d="M386 165 l12 -7 l24 14 M418 192 l12 -7 l23 13 M454 151 l9 -5 l18 10" /></g>
      <circle class="ui-practical-signal" cx="152" cy="109" r="4" />
      <g class="ui-practical-labels"><text x="108" y="232">Original image</text><text x="265" y="232">Resize</text><text x="433" y="250">Ready for each screen</text></g>
    </svg>`;
    const parcel = `<svg viewBox="0 0 560 300" aria-hidden="true">
      <path class="ui-practical-path" d="M82 195 L266 89 L472 208 M266 89 L399 12" />
      <g class="ui-practical-object"><path class="ui-practical-top" d="M196 128 L268 86 L340 128 L268 170 Z" /><path class="ui-practical-side" d="M196 128 L268 170 L268 214 L196 172 Z M268 170 L340 128 L340 172 L268 214 Z" /><path class="ui-practical-detail" d="M214 153 l31 18 M287 175 l33 -19" /><path class="ui-practical-accent" d="M250 128 L268 118 L286 128 L268 138 Z" /></g>
      <g class="ui-practical-object ui-practical-parcel-in"><path class="ui-practical-top" d="M62 182 L84 169 L106 182 L84 195 Z" /><path class="ui-practical-side" d="M62 182 L84 195 L84 218 L62 205 Z M84 195 L106 182 L106 205 L84 218 Z" /><path class="ui-practical-detail" d="M73 175 l22 13" /></g>
      <g class="ui-practical-object ui-practical-parcel-out"><path class="ui-practical-top" d="M391 180 L413 167 L435 180 L413 193 Z" /><path class="ui-practical-side" d="M391 180 L413 193 L413 216 L391 203 Z M413 193 L435 180 L435 203 L413 216 Z" /><path class="ui-practical-detail" d="M402 173 l22 13" /></g>
      <g class="ui-practical-object"><path class="ui-practical-top" d="M364 51 L391 35 L418 51 L391 67 Z" /><path class="ui-practical-side" d="M364 51 L391 67 L391 89 L364 73 Z M391 67 L418 51 L418 73 L391 89 Z" /></g>
      <g class="ui-practical-labels"><text x="82" y="260">Arrive</text><text x="268" y="260">Sort</text><text x="435" y="260">Send onward</text></g>
    </svg>`;
    return html`<figure class="ui-isometric-usecase" role="img" aria-label="${delivery ? "Illustrative parcel sorting hub: packages arrive, are sorted, and travel onward." : "Illustrative image service: an original is resized into several screen sizes."}">${trustedHTML(delivery ? parcel : images)}</figure>`;
  }
}
