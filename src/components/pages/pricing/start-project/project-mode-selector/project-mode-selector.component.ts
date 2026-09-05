import { ApplicationEventService, BaseElement, Component, HostListener, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_START_PROJECT_MODE_EVENT,
  type PricingStartProjectMode,
} from "@app/events/pricing.events.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/**
 * Selects which project-intake form is displayed beneath the pricing introduction.
 *
 * The project-start shell provides the current mode through `selected-mode`. A click
 * or arrow-key change publishes {@link PRICING_START_PROJECT_MODE_EVENT}; the shell
 * consumes that application event and renders the matching focused form component.
 *
 * Selector: `pricing-project-mode-selector`.
 */
@Component({
  selector: "pricing-project-mode-selector",
  shadow: false,
})
export class PricingProjectModeSelectorComponent extends BaseElement {
  /** Selected mode. Attribute `selected-mode`; accepts `spec`, `idea`, or `quote`; defaults to `spec`. */
  @Property({ name: "selected-mode", type: String })
  selectedMode: PricingStartProjectMode = "spec";

  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Initialises the framework component; selection changes are handled by host events. */
  constructor() {
    super();
  }

  /**
   * Publishes a valid mode when a selector card is clicked.
   *
   * @param event - Click from a mode card rendered inside this selector.
   */
  @HostListener({ event: "click" })
  selectProjectMode(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-project-mode]");
    const mode = button?.dataset.projectMode;
    if (!button || !this.contains(button) || !this.isKnownMode(mode) || mode === this.selectedMode) {
      return;
    }

    this.publishMode(mode);
  }

  /**
   * Implements arrow-key radio-group navigation without introducing manual listeners.
   *
   * @param event - Keydown from one of the selector cards.
   */
  @HostListener({ event: "keydown" })
  navigateProjectModes(event: KeyboardEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-project-mode]");
    if (!button || !this.contains(button) || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const modes = pricingContent.startProject.modes;
    const currentIndex = modes.findIndex((mode) => mode.id === this.selectedMode);
    const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const nextMode = modes[(currentIndex + direction + modes.length) % modes.length].id as PricingStartProjectMode;

    this.publishMode(nextMode);
  }

  /** Validates a data attribute against the authored project-intake modes. */
  private isKnownMode(mode: string | undefined): mode is PricingStartProjectMode {
    return pricingContent.startProject.modes.some((item) => item.id === mode);
  }

  /** Publishes a selected mode so the project-start shell can replace the active branch. */
  private publishMode(mode: PricingStartProjectMode): void {
    this.selectedMode = mode;
    void this.publisher.publishAsync({
      name: PRICING_START_PROJECT_MODE_EVENT,
      data: { mode },
    });
  }

  /** Renders the accessible, data-driven project starting-point cards. */
  render(): string {
    const content = pricingContent.startProject;

    return HTML`
      <div class="pricing-project-question">
        <p><span>1</span>${content.modeQuestion}</p>
        <div class="pricing-project-modes" role="radiogroup" aria-label="${content.modeQuestion}">
          ${content.modes.map((mode) => `
            <button class="form-choice input-lg input-rounded-md input-bordered pricing-project-mode ${mode.id === this.selectedMode ? "is-selected" : ""}" type="button" role="radio" aria-checked="${mode.id === this.selectedMode}" data-project-mode="${mode.id}">
              <strong>${escapeHtml(mode.label)}</strong>
              <small>${escapeHtml(mode.description)}</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }
}
