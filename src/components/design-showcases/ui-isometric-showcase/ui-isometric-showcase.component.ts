import { ArticleShowcaseElement } from "../article-showcase.element.ts";
import { Component } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";

/** A line-drawn isometric conveyor machine, animated automatically without reader controls. */
@Component({ selector: "ui-isometric-showcase", shadow: false })
export class UiIsometricShowcaseComponent extends ArticleShowcaseElement {
  /** Keeps the machine and conveyors on the same 30-degree drawing grid. */
  render() {
    const beltLines = Array.from({ length: 8 }, (_, index) => {
      const x = 67 + index * 19;
      const y = 287.5 - index * 11;
      return `<path d="M${x} ${y} l41 24 M${620 - x} ${y} l-41 24" />`;
    }).join("");
    const svg = `<svg viewBox="0 0 620 380" aria-hidden="true">
      <g class="ui-iso-ground"><path d="M36 265 L254 139 L584 265 L486 322 L310 220 L134 322 Z" /></g>

      <g class="ui-iso-body"><path class="ui-iso-left" d="M210 127 L310 185 L310 271 L210 213 Z" /><path class="ui-iso-right" d="M310 185 L410 127 L410 213 L310 271 Z" /><path class="ui-iso-top" d="M210 127 L310 69 L410 127 L310 185 Z" /></g>
      <g class="ui-iso-belt"><path d="M61 291 L221 199 L262 223 L102 315 Z M358 223 L399 199 L559 291 L518 315 Z" /><path d="M61 291 L102 315 V323 L61 299 Z M102 315 L262 223 V231 L102 323 Z M358 223 L518 315 V323 L358 231 Z M518 315 L559 291 V299 L518 323 Z" /></g>
      <g class="ui-iso-belt-lines">${beltLines}</g>
      <g class="ui-iso-port"><path d="M221 167 L262 191 L262 223 L221 199 Z M358 191 L399 167 L399 199 L358 223 Z" /></g>
      <g class="ui-iso-detail"><path d="M253 127 L310 94 L367 127 L310 160 Z M264 127 L310 100 L356 127 L310 154 Z M233 145 L281 173" /><ellipse cx="232" cy="124" rx="5" ry="3" /><ellipse cx="310" cy="79" rx="5" ry="3" /><ellipse cx="388" cy="124" rx="5" ry="3" /><ellipse cx="310" cy="169" rx="5" ry="3" /></g>
      <path class="ui-iso-mark" d="M285 127 L310 113 L335 127 L310 141 Z M298 127 L310 120 L322 127 L310 134 Z" fill-rule="evenodd" />
      <g class="ui-iso-item ui-iso-item-in"><path d="M85 291 L104 280 L123 291 L104 302 Z" /><path d="M85 291 L104 302 V307 L85 296 Z M104 302 L123 291 V296 L104 307 Z" /></g>
      <g class="ui-iso-item ui-iso-item-out"><path d="M367 220 L386 209 L405 220 L386 231 Z" /><path d="M367 220 L386 231 V236 L367 225 Z M386 231 L405 220 V225 L386 236 Z" /></g>
      <ellipse class="ui-iso-light" cx="375" cy="148" rx="5" ry="3" />
      <g class="ui-iso-spares"><path d="M250 326 L310 291 L370 326 L310 361 Z M250 326 L310 361 L310 367 L250 332 Z M310 361 L370 326 L370 332 L310 367 Z" /><path d="M276 320 L291 311 L306 320 L291 329 Z M291 329 L291 338 L276 329 L276 320 M291 338 L306 329 L306 320" /><ellipse cx="326" cy="330" rx="12" ry="7" /><path d="M314 330 v8 a12 7 0 0 0 24 0 v-8" /></g>
    </svg>`;
    return html`<figure class="ui-isometric-specimen" role="img" aria-label="An isometric machine with two conveyor belts carrying small pieces in and out.">${trustedHTML(svg)}</figure>`;
  }
}
