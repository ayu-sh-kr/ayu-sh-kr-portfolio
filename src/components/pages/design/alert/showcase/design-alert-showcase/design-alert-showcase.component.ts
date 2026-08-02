import { BaseElement, Component, HostListener, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { Alert } from "@app/service/alert.service.ts";
import { designAlertContent } from "@app/data/design-alert-content.ts";
import type { DesignAlertReleaseComponent } from "@app/components/pages/design/alert/custom-release/design-alert-release/design-alert-release.component.ts";

/**
 * Runs live built-in and caller-owned alert examples for the design route.
 *
 * The page supplies only demo copy and trigger buttons. Every modal behavior is
 * delegated to {@link Alert}, which makes this a useful regression surface for
 * the same API product components will call.
 */
@Component({
  selector: "design-alert-showcase",
  shadow: false,
})
export class DesignAlertShowcaseComponent extends BaseElement {
  /** Promise result from the most recently answered specimen. */
  private result: string = designAlertContent.showcase.emptyResult;

  /** Creates the live specimen element. */
  constructor() {
    super();
  }

  /** Opens the selected alert specimen and records the returned value for the reference page. */
  @HostListener({ event: "click" })
  async openSpecimen(event: MouseEvent): Promise<void> {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-alert-specimen]");
    const specimen = button?.dataset.alertSpecimen;
    if (!specimen) {
      return;
    }

    const { dialogs } = designAlertContent.showcase;
    let result: string | boolean | null;
    switch (specimen) {
      case "note":
        result = await Alert.note(dialogs.note);
        break;
      case "ask":
        result = await Alert.ask(dialogs.ask);
        break;
      case "risk":
        result = await Alert.risk(dialogs.risk);
        break;
      case "prompt":
        result = await Alert.prompt({
          ...dialogs.prompt,
          field: { ...dialogs.prompt.field, guard: (value) => value.trim().length > 0 && value.trim().length <= 40 },
        });
        break;
      case "custom":
        result = await Alert.custom<string>({
          ...dialogs.custom,
          content: (controller) => {
            const view = document.createElement("design-alert-release") as DesignAlertReleaseComponent;
            view.controller = controller;
            return view;
          },
        });
        break;
      default:
        return;
    }

    this.result = typeof result === "string" ? `“${result}”` : String(result);
    this.updateHTML();
  }

  /** Renders live triggers and the last promise result without duplicating dialog markup. */
  render(): string {
    const { showcase } = designAlertContent;

    return HTML`
      <section id="design-alert-showcase" class="design-alert-showcase layout-page layout-section" aria-labelledby="design-alert-showcase-title">
        <div class="design-alert-showcase-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${showcase.eyebrow}</p>
          <h2 id="design-alert-showcase-title" class="type-section">${showcase.title}</h2>
          <p class="type-lede">${showcase.lede}</p>
        </div>
        <div class="design-alert-showcase-grid layout-grid-auto-sm">
          ${showcase.items.map((item) => HTML`
            <article class="design-alert-specimen design-alert-specimen--${item.tone}">
              <p class="type-label">${item.tone}</p>
              <h3 class="type-card-title">${item.title}</h3>
              <p>${item.body}</p>
              <button class="design-alert-trigger" type="button" data-alert-specimen="${item.id}">${item.action}</button>
            </article>
          `).join("")}
        </div>
        <output class="design-alert-result" aria-live="polite"><span class="type-label">${showcase.resultLabel}</span>${this.result}</output>
      </section>
    `;
  }
}
