import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { actionButtonRegistry } from "@app/service/action-button-registry.service.ts";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Runs production action-button states through local, disposable success and rejection handlers. */
@Component({ selector: "design-interaction-action", shadow: false })
export class DesignInteractionActionComponent extends BaseElement {
  /** Callbacks that unregister the route-only handlers when this section disconnects. */
  private removeHandlers: Array<() => void> = [];

  /** Creates the action lifecycle reference before its production buttons mount. */
  constructor() {
    super();
  }

  /** Registers the two short demo outcomes required by the live shared action-button examples. */
  @OnEvent("connected", true)
  registerActionSpecimens(): void {
    this.removeHandlers = [
      actionButtonRegistry.registerHandler(
        "design.interaction.publish",
        () => new Promise((resolve) => window.setTimeout(resolve, 900)),
      ),
      actionButtonRegistry.registerHandler(
        "design.interaction.retry",
        async () => {
          await new Promise((resolve) => window.setTimeout(resolve, 900));
          throw new Error("Intentional interaction grammar failure.");
        },
      ),
    ];
  }

  /** Removes handlers so later mounts can safely reuse their specimen action names. */
  @OnEvent("disconnected", true)
  unregisterActionSpecimens(): void {
    this.removeHandlers.forEach((removeHandler) => removeHandler());
    this.removeHandlers = [];
  }

  /** Renders the production action buttons rather than a documentation-only lifecycle imitation. */
  render(): string {
    const { action } = designInteractionContent;
    const [resolved, rejected] = action.specimens;

    return HTML`
      <section id="action" class="design-interaction-section layout-page layout-section" aria-labelledby="action-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${action.eyebrow}</p>
          <h2 id="action-title" class="type-section">${action.title}</h2>
          <p class="type-lede">${action.lede}</p>
        </header>
        <div class="design-interaction-action-grid layout-grid-2">
          <article>
            <p class="type-label">${resolved.label}</p>
            <h3 class="type-card-title">${resolved.title}</h3>
            <p>${resolved.body}</p>
            <action-button id="design-interaction-publish" action="design.interaction.publish" variant="accent" label="${resolved.button.label}" busy-label="${resolved.button.busyLabel}" done-label="${resolved.button.doneLabel}">
            </action-button>
          </article>
          <article>
            <p class="type-label">${rejected.label}</p>
            <h3 class="type-card-title">${rejected.title}</h3>
            <p>${rejected.body}</p>
            <action-button id="design-interaction-retry" action="design.interaction.retry" variant="danger" label="${rejected.button.label}" busy-label="${rejected.button.busyLabel}" fail-label="${rejected.button.failLabel}">
            </action-button>
          </article>
        </div>
      </section>`;
  }
}
