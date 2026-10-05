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
    const images = `<svg viewBox="0 0 560 310" aria-hidden="true">
      <path class="ui-practical-path" d="M139 137 L267 63 L414 148" />
      <g class="ui-practical-object"><path class="ui-practical-top" d="M37 150 L128 97 L218 149 L127 202 Z" /><path class="ui-practical-side" d="M37 150 L127 202 V213 L37 161 Z M127 202 L218 149 V160 L127 213 Z" /><path class="ui-practical-picture" d="M60 151 L128 112 L194 150 L126 189 Z M73 153 L106 142 L120 153 L134 140 L182 155" /><ellipse class="ui-practical-accent" cx="151" cy="143" rx="7" ry="4" /></g>
      <g class="ui-practical-object ui-practical-crop"><path class="ui-practical-side" d="M228 74 L272 48 L316 74 L272 100 Z" /><path class="ui-practical-detail" d="M238 74 l17 -10 M262 59 l10 -6 13 8 M306 74 l-16 10 M281 94 l-9 5 -15 -9" /><path class="ui-practical-accent" d="M251 74 L272 62 L293 74 L272 86 Z" /></g>
      <g class="ui-practical-object ui-practical-output">
        <path class="ui-practical-top" d="M355 126 L438 78 L438 173 L355 221 Z" /><path class="ui-practical-side" d="M438 78 l7 4 v95 l-7 -4 M355 221 l7 4 83 -48 -7 -4" /><path class="ui-practical-picture" d="M364 129 L429 91 V166 L364 204 Z M364 177 l19 -34 18 6 28 -42 M390 203 v13 l-22 13 46 -26 -17 -10" />
        <path class="ui-practical-top" d="M446 154 L489 129 V212 L446 237 Z" /><path class="ui-practical-side" d="M489 129 l6 4 v83 l-6 -4 M446 237 l6 4 43 -25 -6 -4" /><path class="ui-practical-picture" d="M453 159 L482 142 V205 L453 222 Z M453 201 l12 -24 17 5" />
      </g>
      <circle class="ui-practical-signal" cx="174" cy="117" r="4" />
      <g class="ui-practical-labels"><text x="127" y="274">Original photo</text><text x="272" y="133">Resize</text><text x="425" y="274">Desktop + phone</text></g>
    </svg>`;
    const parcel = `<svg viewBox="0 0 560 330" aria-hidden="true">
      <path class="ui-practical-road" d="M28 238 L158 163 M158 163 L334 61 M349 199 L500 286" />
      <g class="ui-practical-object"><path class="ui-practical-top" d="M170 121 L254 72 L344 124 L260 173 Z" /><path class="ui-practical-side" d="M170 121 L260 173 V239 L170 187 Z M260 173 L344 124 V190 L260 239 Z" /><path class="ui-practical-detail" d="M177 119 L255 91 L335 122 M254 72 V91 M185 156 L207 169 V197 L185 184 Z M273 184 L310 163 V210 L273 231 Z M273 194 L310 173 M273 203 L310 182 M273 212 L310 191" /><path class="ui-practical-accent" d="M216 141 L244 157 V170 L216 154 Z" /></g>
      <path class="ui-delivery-opening" d="M185 156 L207 169 V197 L185 184 Z M273 184 L310 163 V210 L273 231 Z" />
      <g class="ui-practical-object ui-practical-parcel-in"><path class="ui-practical-top" d="M71 224 L84 216 L97 224 L84 232 Z" /><path class="ui-practical-side" d="M71 224 L84 232 V247 L71 239 Z M84 232 L97 224 V239 L84 247 Z" /><path class="ui-practical-detail" d="M78 220 l13 8" /></g>
      <g class="ui-practical-object ui-delivery-truck">
        <path class="ui-practical-side" d="M368 218 L428 253 L465 274 L500 254 V263 L465 283 L368 227 Z" />
        <path class="ui-practical-top" d="M368 169 L403 149 L463 184 L428 204 Z" />
        <path class="ui-practical-side" d="M368 169 L428 204 V253 L368 218 Z M428 204 L463 184 V233 L428 253 Z" />
        <path class="ui-practical-detail" d="M374 180 L420 207 M374 210 L420 237" />
        <path class="ui-practical-accent" d="M379 192 L416 213 V225 L379 204 Z" />
        <path class="ui-delivery-opening" d="M374 188 L398 202 V226 L374 212 Z" />
        <path class="ui-practical-top" d="M428 216 L463 196 L485 209 L450 229 Z" />
        <path class="ui-practical-side" d="M428 216 L450 229 L465 248 V274 L428 253 Z" />
        <path class="ui-practical-top" d="M450 229 L485 209 L500 228 L465 248 Z" />
        <path class="ui-practical-side" d="M465 248 L500 228 V261 L465 281 Z" />
        <path class="ui-delivery-window" d="M435 226 L447 233 L456 245 L435 233 Z M458 230 L483 215 L494 228 L469 243 Z" />
        <path class="ui-practical-detail" d="M432 237 V252 M435 240 l7 4 M473 251 L493 239 M473 256 L493 244" />
        <path class="ui-delivery-light" d="M469 260 l6 -3 v5 l-6 3 Z M490 248 l6 -3 v5 l-6 3 Z" />
        <path class="ui-practical-detail" d="M465 274 L500 254 M459 241 l-5 -3 v8" />
        <ellipse class="ui-practical-wheel" cx="386" cy="233" rx="8" ry="12" transform="rotate(-12 386 233)" />
        <ellipse class="ui-practical-wheel" cx="452" cy="271" rx="8" ry="12" transform="rotate(-12 452 271)" />
        <ellipse class="ui-delivery-hub" cx="386" cy="233" rx="3" ry="5" transform="rotate(-12 386 233)" />
        <ellipse class="ui-delivery-hub" cx="452" cy="271" rx="3" ry="5" transform="rotate(-12 452 271)" />
      </g>
      <g class="ui-practical-object ui-delivery-parcel-load">
        <path class="ui-practical-accent" d="M278 198 L291 190 L304 198 L291 206 Z" />
        <path class="ui-practical-side" d="M278 198 L291 206 V221 L278 213 Z M291 206 L304 198 V213 L291 221 Z" />
        <path class="ui-practical-detail" d="M285 194 l13 8 M291 206 v7" />
      </g>
      <g class="ui-practical-labels"><text x="83" y="298">Parcel arrives</text><text x="258" y="298">Sorting depot</text><text x="443" y="310">Out for delivery</text></g>
    </svg>`;
    return html`<figure class="ui-isometric-usecase" role="img" aria-label="${delivery ? "Illustrative parcel sorting hub: a parcel enters the depot, then a sorted parcel moves into the truck’s loading hatch." : "Illustrative image service: an original is resized into several screen sizes."}">${trustedHTML(delivery ? parcel : images)}</figure>`;
  }
}
