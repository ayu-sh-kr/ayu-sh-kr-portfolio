import { BaseElement, Component, HTML, HostListener } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";
import { ServiceState, type ServiceCapabilityState } from "@app/service/service-state.service.ts";

/**
 * Design-specimen section that demonstrates capability-scoped maintenance states
 * (`up` / `planned` / `down`) through explicit user triggers.
 *
 * Rendered inside the design system's interaction page. Three scenario buttons
 * force the specimen capability's state via `ServiceState.forceTrigger`, which
 * is the seam {@link ServiceStateService} exposes for demos and tests — no
 * `/status.json` poll is involved here. Clicks are delegated: one host listener
 * reads `data-service-state-trigger` from any clicked button, updates the
 * local `selectedState` (reflected into each button's `aria-pressed`), and
 * pushes the matching status into the service so subscribed consumers react.
 * The component holds no service status of its own; the banner/notice
 * components observing the same capability render the actual state change.
 *
 * Selector: `design-interaction-service-state`.
 */
@Component({ selector: "design-interaction-service-state", shadow: false })
export class DesignInteractionServiceStateComponent extends BaseElement {
  /** Last scenario triggered; drives `aria-pressed` state on the buttons. Defaults to `up`. */
  private selectedState: ServiceCapabilityState = "up";

  constructor() {
    super();
  }

  /**
   * Delegated click handler for the scenario buttons.
   *
   * Reads the clicked `[data-service-state-trigger]` button, ignores clicks on
   * anything else, mirrors the selection into `aria-pressed`, and then calls
   * `ServiceState.forceTrigger` for the specimen capability with a matching
   * status. The `planned` branch synthesizes an `until` timestamp 90 minutes out
   * with a short note so the maintenance state has realistic payload; `up` and
   * `down` force bare statuses. No status document request is made — this never
   * touches the polling driver.
   */
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

  /**
   * Renders the section: heading from `designInteractionContent.serviceState`,
   * the three scenario buttons (initial `aria-pressed` from `selectedState`),
   * a demo form whose submission UX is what the state banner guards, and the
   * authored list of use cases. Purely declarative — all behavior lives in the
   * host click listener.
   */
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
              <label class="form-label form-label" for="service-state-brief">${serviceState.formLabel}</label>
              <textarea class="form-control input-md input-rounded-md input-bordered" id="service-state-brief" placeholder="${serviceState.formPlaceholder}"></textarea>
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
