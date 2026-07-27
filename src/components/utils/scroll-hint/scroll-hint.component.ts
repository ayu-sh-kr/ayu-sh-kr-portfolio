import {BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {escapeHtml} from "@app/utils/html.utils.ts";

/** The direction suggested by the scroll hint animation. */
export type ScrollHintMode = "horizontal" | "vertical";

const DEFAULT_FADE_RATE = 6;
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Renders the portfolio's shared scroll cue.
 *
 * The default vertical mode is the canonical hint used by page heroes. The
 * optional horizontal mode keeps the same directional stroke pattern for
 * layouts that scroll along the inline axis. The optional label keeps
 * contextual copy per pinned hero while the structure and motion remain
 * consistent everywhere.
 *
 * Selector: `scroll-hint`.
 */
@Component({
  selector: "scroll-hint",
  shadow: false,
})
export class ScrollHintComponent extends BaseElement {
  /** Attribute `mode`; defaults to `vertical` when omitted or invalid. */
  @Property({name: "mode", type: String})
  mode: ScrollHintMode = "vertical";

  /** Attribute `label`; visible copy for the hint, defaulting to `Scroll`. */
  @Property({name: "label", type: String})
  label = "Scroll";

  /** Attribute `progress`; the owning pinned hero supplies a value from 0 to 1. */
  @Property({name: "progress", type: String})
  progress = "0";

  constructor() {
    super();
  }

  /** Applies the decorative accessibility contract and the initial fade state. */
  @OnEvent("connected", true)
  initializeHint(): void {
    this.setAttribute("aria-hidden", "true");
    this.updateProgress(this.progress);
  }

  /** Updates progress without re-rendering the component on every scroll frame. */
  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === "progress") {
      this.progress = newValue ?? "0";
      this.updateProgress(this.progress);
      return;
    }

    super.attributeChangedCallback(name, oldValue, newValue);
  }

  /** Renders the direction-specific track and safely escaped visible label. */
  render(): string {
    const mode: ScrollHintMode = this.mode === "horizontal" ? "horizontal" : "vertical";

    return HTML`
      <span class="scroll-hint scroll-hint--${mode}" aria-hidden="true">
        <span class="scroll-hint__label">${escapeHtml(this.label || "Scroll")}</span>
        <span class="scroll-hint__track"></span>
      </span>
    `;
  }

  /** Fades the hint through the final part of the owning hero's pin. */
  private updateProgress(value: string): void {
    const configuredRate = Number.parseFloat(getComputedStyle(this).getPropertyValue("--sh-fade-rate"));
    const fadeRate = Number.isFinite(configuredRate) ? configuredRate : DEFAULT_FADE_RATE;
    const progress = Number.parseFloat(value);
    const normalizedProgress = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0;
    this.style.opacity = globalThis.String(clamp((1 - normalizedProgress) * fadeRate, 0, 1));
  }
}
