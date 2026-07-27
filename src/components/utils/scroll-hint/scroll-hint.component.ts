import {BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {escapeHtml} from "@app/utils/html.utils.ts";

/** The direction suggested by the scroll hint animation. */
export type ScrollHintMode = "horizontal" | "vertical";

/**
 * Renders the portfolio's shared scroll cue.
 *
 * The default horizontal mode is the canonical hint used by the home hero.
 * Page heroes that continue down the document opt into vertical mode. The
 * optional label keeps contextual cues, such as the offline recovery prompt,
 * while the structure and motion remain consistent everywhere.
 *
 * Selector: `scroll-hint`.
 */
@Component({
  selector: "scroll-hint",
  shadow: false,
})
export class ScrollHintComponent extends BaseElement {
  /** Attribute `mode`; defaults to `horizontal` when omitted or invalid. */
  @Property({name: "mode", type: String})
  mode: ScrollHintMode = "horizontal";

  /** Attribute `label`; visible copy for the hint, defaulting to `Scroll`. */
  @Property({name: "label", type: String})
  label = "Scroll";

  constructor() {
    super();
  }

  /** Renders the direction-specific track and safely escaped visible label. */
  render(): string {
    const mode: ScrollHintMode = this.mode === "vertical" ? "vertical" : "horizontal";

    return HTML`
      <span class="scroll-hint scroll-hint--${mode}" aria-hidden="true">
        <span class="scroll-hint__label">${escapeHtml(this.label || "Scroll")}</span>
        <span class="scroll-hint__track"><span class="scroll-hint__indicator"></span></span>
      </span>
    `;
  }
}
