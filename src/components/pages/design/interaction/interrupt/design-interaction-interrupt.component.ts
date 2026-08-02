import {
  BaseElement,
  Component,
  HostListener,
  HTML,
} from "@ayu-sh-kr/dota-wrap/core";
import { Alert } from "@app/service/alert.service.ts";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Exercises the shared native alert instead of maintaining a page-specific modal implementation. */
@Component({ selector: "design-interaction-interrupt", shadow: false })
export class DesignInteractionInterruptComponent extends BaseElement {
  /** Creates the interruption reference section. */
  constructor() {
    super();
  }

  /** Opens the risk alert so focus, top-layer and cancellation behavior remain the production behavior. */
  @HostListener({ event: "click" })
  openRiskAlert(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest("[data-interaction-alert]"))
      return;
    void Alert.risk(designInteractionContent.interrupt.dialog);
  }

  /** Renders the one trigger that opens the production destructive confirmation. */
  render(): string {
    const { interrupt } = designInteractionContent;

    return HTML`
      <section id="interrupt" class="design-interaction-section layout-page layout-section" aria-labelledby="interrupt-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${interrupt.eyebrow}</p>
          <h2 id="interrupt-title" class="type-section">${interrupt.title}</h2>
          <p class="type-lede">${interrupt.lede}</p>
        </header>
        <button type="button" class="design-interaction-risk" data-interaction-alert>${interrupt.buttonLabel}</button>
      </section>`;
  }
}
