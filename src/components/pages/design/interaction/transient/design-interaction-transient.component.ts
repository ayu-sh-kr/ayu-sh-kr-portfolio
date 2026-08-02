import {
  BaseElement,
  Component,
  HostListener,
  HTML,
} from "@ayu-sh-kr/dota-wrap/core";
import { Toast } from "@app/service/toast.service.ts";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Delegates transient examples to the singleton toast rail used by every product route. */
@Component({ selector: "design-interaction-transient", shadow: false })
export class DesignInteractionTransientComponent extends BaseElement {
  /** Creates the shared-toast reference section. */
  constructor() {
    super();
  }

  /** Routes each specimen trigger to its matching production Toast API method. */
  @HostListener({ event: "click" })
  showToast(event: MouseEvent): void {
    const kind = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-interaction-transient]",
    )?.dataset.interactionTransient;
    const { controls } = designInteractionContent.transient;
    if (kind === "note") Toast.note(controls.note.message);
    if (kind === "success") Toast.done(controls.success.message);
    if (kind === "error") Toast.fail(controls.error.message);
  }

  /** Renders three production toast outcomes without introducing a second notification host. */
  render(): string {
    const { transient } = designInteractionContent;

    return HTML`
      <section id="transient" class="design-interaction-section layout-page layout-section" aria-labelledby="transient-title">
          <header class="design-interaction-heading layout-stack layout-stack-sm">
            <p class="type-eyebrow">${transient.eyebrow}</p>
            <h2 id="transient-title" class="type-section">${transient.title}</h2>
            <p class="type-lede">${transient.lede}</p>
          </header>
          <div class="design-interaction-state-controls">
            <button type="button" data-interaction-transient="note">${transient.controls.note.label}</button>
            <button type="button" data-interaction-transient="success">${transient.controls.success.label}</button>
            <button type="button" data-interaction-transient="error">${transient.controls.error.label}</button>
          </div>
        </section>`;
  }
}
