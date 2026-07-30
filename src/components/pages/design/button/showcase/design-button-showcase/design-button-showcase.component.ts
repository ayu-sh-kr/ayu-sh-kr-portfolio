import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { designButtonContent } from "@app/data/design-button-content.ts";
import { actionButtonRegistry } from "@app/service/action-button-registry.service.ts";

/** Resolves after a short delay so success specimens visibly enter the same pending state as real work. */
const waitForSpecimen = (): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, 850));

/**
 * Live production-button specimens for the `/design/button` reference route.
 *
 * The section registers short-lived demo handlers on connect rather than manufacturing states
 * in markup. Each nested `action-button` publishes to the same dispatcher used by features;
 * three handlers resolve and the danger specimen rejects. Disconnect removes every handler so
 * these demonstration names cannot leak into another route.
 *
 * Selector: `design-button-showcase`.
 */
@Component({ selector: "design-button-showcase", shadow: false })
export class DesignButtonShowcaseComponent extends BaseElement {
  /** Unregister callbacks retained so this temporary design page ownership ends cleanly on route teardown. */
  private removeHandlers: Array<() => void> = [];

  /** Creates the specimen host; action work is registered in its connected lifecycle. */
  constructor() {
    super();
  }

  /** Registers resolve handlers and one deliberate rejection before the displayed buttons can publish their action names. */
  @OnEvent("connected", true)
  onConnected(): void {
    this.removeHandlers = [
      actionButtonRegistry.registerHandler("design.button.publish", waitForSpecimen),
      actionButtonRegistry.registerHandler("design.button.save", waitForSpecimen),
      actionButtonRegistry.registerHandler("design.button.check", waitForSpecimen),
      actionButtonRegistry.registerHandler("design.button.remove", async () => {
        await waitForSpecimen();
        throw new Error("Intentional specimen rejection.");
      }),
    ];
  }

  /** Calls every unregister callback on disconnect, allowing a fresh page mount to register the same specimen names safely. */
  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.removeHandlers.forEach((removeHandler) => removeHandler());
    this.removeHandlers = [];
  }

  /** Renders all four color variants as production elements; their labels and action names come from page-owned content. */
  render(): string {
    const { showcase } = designButtonContent;
    return HTML`
      <section id="design-button-showcase" class="design-button-showcase layout-page layout-section" aria-labelledby="design-button-showcase-title">
        <div class="design-button-showcase__heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${showcase.eyebrow}</p>
          <h2 id="design-button-showcase-title" class="type-section">${showcase.title}</h2>
          <p class="type-lede">${showcase.lede}</p>
        </div>
        <div class="design-button-showcase__grid layout-grid-auto-sm">
          ${showcase.actions.map((item) => HTML`
            <article class="design-button-card" data-variant="${item.variant}">
              <p class="type-label">${item.variant}</p>
              <h3 class="type-card-title">${item.title}</h3>
              <p>${item.body}</p>
              <action-button id="design-button-${item.id}" action="${item.action}" variant="${item.variant}" label="${item.label}" busy-label="${item.busyLabel}" done-label="${item.doneLabel}" fail-label="${item.failLabel}"></action-button>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }
}
