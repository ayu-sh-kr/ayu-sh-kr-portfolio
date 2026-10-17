import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import {
  BaseElement,
  Component,
  HostListener,
  } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Keeps the ingest contract separate from the later action lifecycle it hands work to. */
@Component({ selector: "design-interaction-ingest", shadow: false })
export class DesignInteractionIngestComponent extends BaseElement {
  /** File name accepted by the local drop-zone specimen. */
  private uploadedNames: string[] = [];

  /** Creates the independent ingest specimen. */
  constructor() {
    super();
  }

  /** Adds or removes the short-lived specimen file without imposing an artificial exit animation. */
  @HostListener({ event: "click" })
  updateAcceptedFile(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button",
    );
    if (!button) return;
    if (button.dataset.interactionUpload !== undefined)
      this.uploadedNames = this.uploadedNames.length
        ? []
        : [designInteractionContent.ingest.sampleName];
    if (button.dataset.interactionRemove)
      this.uploadedNames = this.uploadedNames.filter(
        (name) => name !== button.dataset.interactionRemove,
      );
    if (
      button.dataset.interactionUpload !== undefined ||
      button.dataset.interactionRemove
    )
      this.updateHTML();
  }

  /** Renders the one sanctioned dashed surface and its immediate chip confirmation. */
  render(): TemplateResult {
    const { ingest } = designInteractionContent;

    return html`
      <section id="ingest" class="design-interaction-section layout-page layout-section" aria-labelledby="ingest-title">
          <header class="design-interaction-heading layout-stack layout-stack-sm">
            <p class="type-eyebrow">${ingest.eyebrow}</p>
            <h2 id="ingest-title" class="type-section">${ingest.title}</h2>
            <p class="type-lede">${ingest.lede}</p>
          </header>
          <div class="design-interaction-upload">
            <p class="type-label">${ingest.label}</p>
            <strong>${this.uploadedNames.length ? ingest.acceptedTitle : ingest.emptyTitle}</strong>
            <button type="button" data-interaction-upload>${this.uploadedNames.length ? ingest.clearLabel : ingest.acceptLabel}</button>
          </div>
          <div class="design-interaction-chips" aria-label="${ingest.filesAriaLabel}">${this.uploadedNames
            .map(
              (
                name,
              ) => html`<span>${name}<button type="button" data-interaction-remove="${name}" aria-label="${ingest.removeAriaLabel.replace("{name}", name)}">${ingest.removeLabel}</button>
            </span>`,
            )}</div>
        </section>`;
  }
}
