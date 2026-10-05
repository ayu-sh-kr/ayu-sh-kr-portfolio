import { BaseElement, Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";

/**
 * Product-specific motion studies embedded in the design article.
 * Selector `ui-motion-showcase` accepts save, expand, reorder, cart or sheet.
 * Each scene includes the object, the change and its result. CSS runs the study
 * automatically; reduced motion retains the final state. No real actions occur.
 */
@Component({ selector: "ui-motion-showcase", shadow: false })
export class UiMotionShowcaseComponent extends BaseElement {
  /** Attribute `example` selects a study; defaults to save and falls back to it. */
  @Property({ name: "example", type: String })
  example = "save";

  /** Composes authored SVG content without controls, timers or network requests. */
  render() {
    const scenes = {
      save: `<rect class="ui-motion-panel" x="24" y="22" width="432" height="316" rx="18" />
        <text class="ui-motion-heading" x="48" y="60">Client handoff</text>
        <g transform="translate(48 80)"><rect class="ui-motion-tile" width="126" height="146" rx="8" /><rect class="ui-motion-paper" x="15" y="13" width="97" height="120" rx="3" /><path class="ui-motion-accent" d="M25 82 l20 -31 20 20 13 -13 22 24 Z" /><circle class="ui-motion-accent" cx="82" cy="41" r="8" /><path class="ui-motion-rule" d="M25 100 h74 M25 111 h46" /></g>
        <text class="ui-motion-heading" x="193" y="111">Moodboard.jpg</text>
        <text class="ui-motion-small" x="193" y="138">2.4 MB · Image file</text>
        <g class="ui-motion-pending"><text x="193" y="182">Uploading…</text><text class="ui-motion-small" x="193" y="208">Keep this window open</text></g>
        <g class="ui-motion-complete"><path class="ui-motion-check" d="M194 179 l7 7 14 -16" /><text x="225" y="184">Ready to share</text><text class="ui-motion-small" x="193" y="210">File received</text></g>
        <path class="ui-motion-track" d="M48 261 H432" /><path class="ui-motion-progress" d="M48 261 H432" />
        <text class="ui-motion-small" x="48" y="306">Spring collection · Design review</text>`,
      expand: `<rect class="ui-motion-panel" x="18" y="18" width="444" height="326" rx="18" />
        <g class="ui-motion-album-grid"><text class="ui-motion-heading" x="42" y="55">Weekend albums</text>
          <rect class="ui-motion-tile" x="170" y="78" width="110" height="70" rx="8" /><path class="ui-motion-soft-land" d="M170 130 l24 -25 20 18 22 -33 44 40 V148 H170 Z" />
          <rect class="ui-motion-tile" x="298" y="78" width="110" height="70" rx="8" /><path class="ui-motion-soft-land" d="M298 121 q28 -22 55 0 t55 0 V148 H298 Z" />
          <text class="ui-motion-small" x="170" y="177">Hill country</text><text class="ui-motion-small" x="298" y="177">Along the coast</text>
          <text class="ui-motion-small" x="42" y="257">Open the album to explore</text>
        </g>
        <g class="ui-motion-album-image"><rect class="ui-motion-tile" x="42" y="78" width="110" height="70" rx="4" /><circle class="ui-motion-sun" cx="125" cy="96" r="7" /><path class="ui-motion-soft-land" d="M42 119 q26 -17 48 1 t62 -2 V148 H42 Z" /><path class="ui-motion-accent" d="M42 133 q24 -17 51 -3 t59 0 V148 H42 Z" /><path class="ui-motion-water" d="M64 139 q18 -8 48 0" /></g>
        <text class="ui-motion-small ui-motion-album-label" x="42" y="177">Lakeside</text>
        <circle class="ui-motion-touch" cx="99" cy="114" r="15" />
        <g class="ui-motion-album-detail"><text class="ui-motion-heading" x="30" y="314">Lakeside walks</text><text class="ui-motion-small" x="30" y="338">12 photos · Your Saturday by the water</text></g>`,
      reorder: `<rect class="ui-motion-panel" x="24" y="22" width="432" height="316" rx="18" />
        <text class="ui-motion-heading" x="44" y="59">On the way home</text><text class="ui-motion-small" x="44" y="83">Your listening queue</text>
        <g class="ui-motion-queue-current"><rect class="ui-motion-tile" x="42" y="100" width="396" height="58" rx="10" /><rect class="ui-motion-art" x="52" y="109" width="40" height="40" rx="6" /><path class="ui-motion-art-detail" d="M62 136 v-10 M72 140 v-23 M82 134 v-7" /><text x="106" y="125">City lights</text><text class="ui-motion-small" x="106" y="147">Playing now</text><text class="ui-motion-small" x="383" y="135">3:42</text></g>
        <g class="ui-motion-queue-down"><rect class="ui-motion-paper" x="42" y="170" width="396" height="58" rx="10" /><rect class="ui-motion-art" x="52" y="179" width="40" height="40" rx="6" /><path class="ui-motion-art-detail" d="M58 211 l12 -17 16 11" /><text x="106" y="195">Coastal road</text><text class="ui-motion-small" x="106" y="217">Lena Park</text><text class="ui-motion-small" x="383" y="205">4:08</text></g>
        <g class="ui-motion-queue-up"><rect class="ui-motion-queue-selected" x="42" y="240" width="396" height="58" rx="10" /><rect class="ui-motion-art" x="52" y="249" width="40" height="40" rx="6" /><path class="ui-motion-art-detail" d="M60 266 h23 M64 272 h16 M69 278 h8" /><text x="106" y="265">After the rain</text><text class="ui-motion-small" x="106" y="287">Noah Ellis</text><text class="ui-motion-small" x="347" y="275">Play next</text></g>`,
      cart: `<rect class="ui-motion-panel" x="24" y="22" width="432" height="316" rx="18" />
        <text class="ui-motion-heading" x="44" y="59">Everyday objects</text>
        <path class="ui-motion-icon" d="M405 40 v-6 a8 8 0 0 1 16 0 v6 M399 40 h28 l-3 21 h-22 Z" />
        <g class="ui-motion-cart-count"><circle class="ui-motion-accent" cx="432" cy="35" r="11" /><text class="ui-motion-count" x="432" y="40">1</text></g>
        <rect class="ui-motion-tile" x="44" y="82" width="169" height="166" rx="12" />
        <g class="ui-motion-mug"><path class="ui-motion-mug-body" d="M93 137 h61 v55 q-30 26 -61 0 Z" /><path class="ui-motion-mug-handle" d="M154 148 h10 a20 20 0 0 1 0 39 h-10" /><ellipse class="ui-motion-mug-rim" cx="123.5" cy="137" rx="30.5" ry="9" /><path class="ui-motion-mug-glaze" d="M102 150 v38" /></g>
        <text class="ui-motion-heading" x="236" y="110">Everyday mug</text><text class="ui-motion-small" x="236" y="139">Sage · 300 ml</text><text class="ui-motion-heading" x="236" y="178">₹650</text>
        <rect class="ui-motion-action" x="236" y="199" width="193" height="46" rx="9" /><text class="ui-motion-action-label" x="332" y="229">Add to bag</text>
        <g class="ui-motion-cart-receipt"><rect class="ui-motion-tile" x="44" y="269" width="385" height="49" rx="8" /><path class="ui-motion-check" d="M58 292 l6 6 12 -14" /><text class="ui-motion-small" x="89" y="298">1 sage mug in your bag · ₹650</text></g>
        <g class="ui-motion-cart-travel"><rect class="ui-motion-art" x="312" y="212" width="24" height="24" rx="5" /><path class="ui-motion-art-detail" d="M319 219 h8 v9 h-8 Z" /></g>`,
      sheet: `<defs><clipPath id="ui-motion-map-clip"><rect x="24" y="22" width="432" height="316" rx="18" /></clipPath></defs>
        <g clip-path="url(#ui-motion-map-clip)"><rect class="ui-motion-tile" x="24" y="22" width="432" height="316" />
          <path class="ui-motion-park" d="M24 22 H192 L177 138 88 163 24 139 Z M379 194 L456 174 V338 H322 Z" />
          <path class="ui-motion-road" d="M20 188 L469 69 M193 7 L298 356 M64 330 L454 215" />
          <path class="ui-motion-road-centre" d="M20 188 L469 69 M193 7 L298 356 M64 330 L454 215" />
          <path class="ui-motion-route" d="M118 207 L218 178 L254 121 L321 103" />
          <circle class="ui-motion-location" cx="118" cy="207" r="9" /><circle class="ui-motion-location-core" cx="118" cy="207" r="4" />
          <path class="ui-motion-pin" d="M321 78 a14 14 0 0 0 -14 14 c0 13 14 25 14 25 s14 -12 14 -25 a14 14 0 0 0 -14 -14 Z" /><circle class="ui-motion-pin-core" cx="321" cy="92" r="4" />
          <rect class="ui-motion-paper" x="40" y="38" width="197" height="43" rx="10" /><text class="ui-motion-small" x="55" y="65">Explore nearby places</text>
          <g class="ui-motion-place-sheet"><rect class="ui-motion-panel" x="24" y="215" width="432" height="135" rx="17" /><path class="ui-motion-sheet-handle" d="M220 229 h40" /><text class="ui-motion-heading" x="46" y="265">Riverside Café</text><text class="ui-motion-small" x="46" y="292">8 min walk · Open until 8 pm</text><path class="ui-motion-check" d="M45 315 h13 m-5 -5 5 5 -5 5" /><text class="ui-motion-small" x="72" y="321">Walking route stays in view</text></g>
        </g><rect class="ui-motion-frame" x="24" y="22" width="432" height="316" rx="18" />`
    };
    const descriptions = {
      save: "Illustrative client handoff: Moodboard.jpg uploads, the progress completes, and Ready to share confirms receipt.",
      expand: "Illustrative photo library: selecting Lakeside walks expands the same landscape into an album detail view.",
      reorder: "Illustrative music queue: After the rain moves to play next while City lights keeps playing.",
      cart: "Illustrative shop: one sage mug is added to the bag; the count and persistent receipt confirm the selected item and price.",
      sheet: "Illustrative map: a Riverside Café detail sheet rises from the bottom while the destination and walking route remain visible."
    };
    const example = Object.hasOwn(scenes, this.example) ? this.example as keyof typeof scenes : "save";
    return html`<figure class="ui-motion-showcase ui-motion-${example}" role="img" aria-label="${descriptions[example]}">${trustedHTML(`<svg viewBox="0 0 480 360" aria-hidden="true">${scenes[example]}</svg>`)}</figure>`;
  }
}
