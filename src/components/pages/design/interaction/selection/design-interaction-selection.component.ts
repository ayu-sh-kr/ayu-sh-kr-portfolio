import {
  BaseElement,
  Component,
  HostListener,
  HTML,
} from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

const SELECTION_ACCORDION_CONFIG = JSON.stringify({
  container: "design-interaction-disclosure-container",
  button: {
    base: "design-interaction-disclosure-button",
    size: { md: "" },
    color: { gray: { solid: "", ghost: "" } },
  },
  paragraph: "design-interaction-disclosure-answer",
});

/** Demonstrates selection as a native button state alongside a Dota accordion disclosure. */
@Component({ selector: "design-interaction-selection", shadow: false })
export class DesignInteractionSelectionComponent extends BaseElement {
  /** Selected choice reflected through `aria-pressed` by the live specimen. */
  private selectedChoice: string = designInteractionContent.selection.choices[0];

  /** Creates the commitment specimen. */
  constructor() {
    super();
  }

  /** Stores the selected option and re-renders only this self-contained commitment section. */
  @HostListener({ event: "click" })
  selectChoice(event: MouseEvent): void {
    const choice = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-interaction-choice]",
    )?.dataset.interactionChoice;
    if (!choice) return;
    this.selectedChoice = choice;
    this.updateHTML();
  }

  /** Renders choice cards and the shared Dota accordion disclosure. */
  render(): string {
    const { selection } = designInteractionContent;

    return HTML`
      <section id="selection" class="design-interaction-section layout-page layout-section" aria-labelledby="selection-title">
          <header class="design-interaction-heading layout-stack layout-stack-sm">
            <p class="type-eyebrow">${selection.eyebrow}</p>
            <h2 id="selection-title" class="type-section">${selection.title}</h2>
            <p class="type-lede">${selection.lede}</p>
          </header>
          <div class="design-interaction-spec-grid layout-grid-auto-sm">${selection.choices
            .map(
              (
                choice,
              ) => HTML`<button type="button" class="design-interaction-choice" data-interaction-choice="${choice}" aria-pressed="${String(this.selectedChoice === choice)}">
              <strong>${choice}</strong>
              <span>${this.selectedChoice === choice ? selection.selectedLabel : selection.chooseLabel}</span>
            </button>`,
            )
            .join("")}</div>
          <dota-accordion
            classname="design-interaction-disclosure"
            header="${selection.disclosure.summary}"
            description="${selection.disclosure.body}"
            config='${SELECTION_ACCORDION_CONFIG}'
          ></dota-accordion>
        </section>`;
  }
}
