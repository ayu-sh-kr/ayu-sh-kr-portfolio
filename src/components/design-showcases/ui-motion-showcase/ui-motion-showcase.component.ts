import { BaseElement, Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";

/**
 * Automatic interface-state studies for the UI design article.
 * Selector `ui-motion-showcase` accepts a save, expand or reorder example.
 * CSS repeats the illustrative sequence; reduced motion shows a settled state.
 * These drawings do not perform real user actions or load external data.
 */
@Component({ selector: "ui-motion-showcase", shadow: false })
export class UiMotionShowcaseComponent extends BaseElement {
  /** Attribute `example`: save (default), expand or reorder; other values show save. */
  @Property({ name: "example", type: String })
  example = "save";

  /** Selects an authored SVG scene; all text and geometry are trusted local content. */
  render() {
    const example = ["expand", "reorder"].includes(this.example) ? this.example : "save";
    const scenes = {
      save: `<rect class="ui-motion-panel" x="60" y="30" width="420" height="230" rx="18" />
        <text class="ui-motion-heading" x="87" y="69">Trip notes</text>
        <path class="ui-motion-rule" d="M87 99 H354 M87 120 H405 M87 141 H317" />
        <path class="ui-motion-progress-track" d="M87 183 H451" />
        <path class="ui-motion-progress" d="M87 183 H451" />
        <g class="ui-motion-saving"><circle class="ui-motion-spinner" cx="96" cy="224" r="8" /><text x="114" y="229">Saving changes…</text></g>
        <g class="ui-motion-saved"><path class="ui-motion-check" d="M87 223 l6 6 12 -13" /><text x="114" y="229">All changes saved</text></g>`,
      expand: `<text class="ui-motion-heading" x="48" y="39">Your collection</text>
        <rect class="ui-motion-panel" x="48" y="63" width="444" height="197" rx="14" />
        <rect class="ui-motion-quiet-tile" x="277" y="85" width="88" height="74" rx="9" />
        <rect class="ui-motion-quiet-tile" x="380" y="85" width="88" height="74" rx="9" />
        <path class="ui-motion-rule" d="M277 183 H467 M277 205 H426" />
        <rect class="ui-motion-expanding-card" x="69" y="85" width="183" height="151" rx="10" />
        <g class="ui-motion-landscape"><path d="M86 161 l44 -41 37 30 27 -20 41 31 Z" /><circle cx="205" cy="110" r="9" /></g>
        <text class="ui-motion-card-title" x="87" y="217">Weekend walks</text>
        <g class="ui-motion-detail"><text x="87" y="201">Weekend walks</text><text class="ui-motion-small" x="87" y="226">12 photos · Lake District</text></g>`,
      reorder: `<text class="ui-motion-heading" x="62" y="42">This week</text>
        <g class="ui-motion-row ui-motion-row-first"><rect class="ui-motion-panel" x="62" y="64" width="416" height="56" rx="10" /><circle class="ui-motion-dot" cx="86" cy="92" r="4" /><text x="105" y="98">Review the draft</text><path class="ui-motion-rule" d="M446 87 h12 M446 94 h12" /></g>
        <g class="ui-motion-row ui-motion-row-second"><rect class="ui-motion-panel" x="62" y="132" width="416" height="56" rx="10" /><circle class="ui-motion-dot" cx="86" cy="160" r="4" /><text x="105" y="166">Choose the photos</text><path class="ui-motion-rule" d="M446 155 h12 M446 162 h12" /></g>
        <g class="ui-motion-row"><rect class="ui-motion-panel" x="62" y="200" width="416" height="56" rx="10" /><circle class="ui-motion-dot" cx="86" cy="228" r="4" /><text x="105" y="234">Publish the story</text><path class="ui-motion-rule" d="M446 223 h12 M446 230 h12" /></g>`
    };
    const descriptions = {
      save: "Illustrative notes interface: a progress line completes and a saved confirmation appears automatically.",
      expand: "Illustrative photo collection: the same album card expands into a detail view automatically.",
      reorder: "Illustrative task list: two named rows exchange positions automatically while the third stays in place."
    };
    return html`<figure class="ui-motion-showcase ui-motion-${example}" role="img" aria-label="${descriptions[example as keyof typeof descriptions]}">${trustedHTML(`<svg viewBox="0 0 540 290" aria-hidden="true">${scenes[example as keyof typeof scenes]}</svg>`)}</figure>`;
  }
}
