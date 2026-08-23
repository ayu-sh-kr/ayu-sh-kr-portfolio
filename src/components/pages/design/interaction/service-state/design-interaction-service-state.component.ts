import { BaseElement, Component, HTML, HostListener } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";
import { ServiceState, type ServiceCapabilityState } from "@app/service/service-state.service.ts";

/** Demonstrates capability-scoped maintenance states through explicit user triggers. */
@Component({ selector: "design-interaction-service-state", shadow: false })
export class DesignInteractionServiceStateComponent extends BaseElement {
  private selectedState: ServiceCapabilityState = "up";

  constructor() {
    super();
  }

  /** Forces only the local specimen capability; no status document request is made. */
  @HostListener({ event: "click" })
  triggerScenario(event: MouseEvent): void {
    const state = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-service-state-trigger]")?.dataset.serviceStateTrigger;
    if (state !== "up" && state !== "planned" && state !== "down") {
      return;
    }
    this.selectedState = state;
    this.querySelectorAll<HTMLButtonElement>("[data-service-state-trigger]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.serviceStateTrigger === this.selectedState));
    });
    if (state === "up") {
      ServiceState.forceTrigger(designInteractionContent.serviceState.capability, { state: "up" });
      return;
    }
    if (state === "planned") {
      ServiceState.forceTrigger(designInteractionContent.serviceState.capability, {
        state: "planned",
        until: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        note: "Moving the intake inbox",
      });
      return;
    }
    if (state === "down") {
      ServiceState.forceTrigger(designInteractionContent.serviceState.capability, { state: "down" });
    }
  }

  render(): string {
    const { serviceState } = designInteractionContent;
    return HTML`
      <section id="service-state" class="design-interaction-section layout-page layout-section" aria-labelledby="service-state-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${serviceState.eyebrow}</p>
          <h2 id="service-state-title" class="type-section">${serviceState.title}</h2>
          <p class="type-lede">${serviceState.lede}</p>
        </header>
        <div class="design-interaction-service-state layout-grid-2">
          <article class="design-interaction-service-state__demo">
            <div class="design-interaction-state-controls" aria-label="Service state scenarios">
              <button type="button" data-service-state-trigger="up" aria-pressed="${String(this.selectedState === "up")}">${serviceState.controls.up}</button>
              <button type="button" data-service-state-trigger="planned" aria-pressed="${String(this.selectedState === "planned")}">${serviceState.controls.planned}</button>
              <button type="button" data-service-state-trigger="down" aria-pressed="${String(this.selectedState === "down")}">${serviceState.controls.down}</button>
            </div>
            <div class="design-interaction-service-state__form">
              <label for="service-state-brief">${serviceState.formLabel}</label>
              <textarea id="service-state-brief" placeholder="${serviceState.formPlaceholder}"></textarea>
              <button type="button">${serviceState.submitLabel}</button>
            </div>
          </article>
          <div class="design-interaction-service-state__cases">
            ${serviceState.useCases.map((useCase) => HTML`
              <article>
                <h3 class="type-card-title">${useCase.title}</h3>
                <p>${useCase.body}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>`;
  }
}
