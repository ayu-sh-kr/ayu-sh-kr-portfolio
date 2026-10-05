import { ArticleShowcaseElement } from "../article-showcase.element.ts";
import { Component } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";

/** A line-drawn isometric conveyor machine, animated automatically without reader controls. */
@Component({ selector: "ui-isometric-showcase", shadow: false })
export class UiIsometricShowcaseComponent extends ArticleShowcaseElement {
  /** Keeps the machine and conveyors on the same 30-degree drawing grid. */
  render() {
    const beltLines = Array.from({ length: 8 }, (_, index) => {
      const x = 58 + index * 18;
      const y = 254 - index * 10.4;
      return `<path d="M${x} ${y} l52 30 M${620 - x} ${y} l-52 30" />`;
    }).join("");
    const svg = `<svg viewBox="0 0 620 380" aria-hidden="true">
      <g class="ui-iso-ground"><path d="M36 265 L254 139 L584 265 L486 322 L310 220 L134 322 Z" /></g>
      <g class="ui-iso-belt"><path d="M42 262 L228 155 L280 185 L94 292 Z M340 185 L392 155 L578 262 L526 292 Z" /><path d="M42 262 L94 292 L94 302 L42 272 Z M94 292 L280 185 L280 195 L94 302 Z M340 185 L526 292 L526 302 L340 195 Z M526 292 L578 262 L578 272 L526 302 Z" /></g>
      <g class="ui-iso-belt-lines">${beltLines}</g>
      <g class="ui-iso-body"><path class="ui-iso-left" d="M210 127 L310 185 L310 271 L210 213 Z" /><path class="ui-iso-right" d="M310 185 L410 127 L410 213 L310 271 Z" /><path class="ui-iso-top" d="M210 127 L310 69 L410 127 L310 185 Z" /></g>
      <g class="ui-iso-port"><path d="M221 167 L262 191 L262 223 L221 199 Z M358 191 L399 167 L399 199 L358 223 Z" /></g>
      <g class="ui-iso-detail"><path d="M253 127 L310 94 L367 127 L310 160 Z M264 127 L310 100 L356 127 L310 154 Z M233 145 L281 173" /><ellipse cx="232" cy="124" rx="5" ry="3" /><ellipse cx="310" cy="79" rx="5" ry="3" /><ellipse cx="388" cy="124" rx="5" ry="3" /><ellipse cx="310" cy="169" rx="5" ry="3" /></g>
      <path class="ui-iso-mark" d="M285 127 L310 113 L335 127 L310 141 Z M298 127 L310 120 L322 127 L310 134 Z" fill-rule="evenodd" />
      <g class="ui-iso-item ui-iso-item-in"><path d="M86 254 L105 243 L124 254 L105 265 Z" /><path d="M86 254 L105 265 L105 270 L86 259 Z M105 265 L124 254 L124 259 L105 270 Z" /></g>
      <g class="ui-iso-item ui-iso-item-out"><path d="M372 208 L391 197 L410 208 L391 219 Z" /><path d="M372 208 L391 219 L391 224 L372 213 Z M391 219 L410 208 L410 213 L391 224 Z" /></g>
      <ellipse class="ui-iso-light" cx="375" cy="148" rx="5" ry="3" />
      <g class="ui-iso-spares"><path d="M250 326 L310 291 L370 326 L310 361 Z M250 326 L310 361 L310 367 L250 332 Z M310 361 L370 326 L370 332 L310 367 Z" /><path d="M276 320 L291 311 L306 320 L291 329 Z M291 329 L291 338 L276 329 L276 320 M291 338 L306 329 L306 320" /><ellipse cx="326" cy="330" rx="12" ry="7" /><path d="M314 330 v8 a12 7 0 0 0 24 0 v-8" /></g>
    </svg>`;
    return html`<figure class="ui-isometric-specimen" role="img" aria-label="An isometric machine with two conveyor belts carrying small pieces in and out.">${trustedHTML(svg)}</figure>`;
  }
}
