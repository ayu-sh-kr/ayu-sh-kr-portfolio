import {
  BaseElement,
  Component,
  HostListener,
  HTML,
} from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Isolates the input-to-number recomputation pattern and its single polite announcement. */
@Component({ selector: "design-interaction-recompute", shadow: false })
export class DesignInteractionRecomputeComponent extends BaseElement {
  /** Creates the static estimator before its range input emits updates. */
  constructor() {
    super();
  }

  /** Updates only the output that changed, preserving the focused range control during interaction. */
  @HostListener({ event: "input" })
  updateEstimate(event: Event): void {
    const field = event.target;
    if (
      !(field instanceof HTMLInputElement) ||
      field.dataset.interactionUnits === undefined
    )
      return;
    const output = this.querySelector<HTMLOutputElement>(
      "#interaction-estimate",
    );
    if (!output) return;
    const { recompute } = designInteractionContent;
    output.querySelector("strong")!.textContent =
      `${recompute.currency}${(Number(field.value) * 1800).toLocaleString("en-IN")}`;
    output.querySelector("small")!.textContent =
      recompute.daySummary.replace("{days}", field.value);
  }

  /** Renders the established light-input / contrast-number composition. */
  render(): string {
    const { recompute } = designInteractionContent;

    return HTML`
      <section id="recompute" class="design-interaction-section layout-page layout-section" aria-labelledby="recompute-title">
          <header class="design-interaction-heading layout-stack layout-stack-sm">
            <p class="type-eyebrow">${recompute.eyebrow}</p>
            <h2 id="recompute-title" class="type-section">${recompute.title}</h2>
            <p class="type-lede">${recompute.lede}</p>
          </header>
          <div class="design-interaction-estimator">
            <label for="interaction-units">${recompute.inputLabel} <input id="interaction-units" data-interaction-units type="range" min="1" max="8" value="3" />
            </label>
            <output id="interaction-estimate" aria-live="polite">
              <span>${recompute.investmentLabel}</span>
              <strong>${recompute.initialInvestment}</strong>
              <small>${recompute.daySummary.replace("{days}", "3")}</small>
            </output>
          </div>
        </section>`;
  }
}
