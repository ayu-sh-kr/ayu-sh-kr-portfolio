import { ApplicationEventService, BaseElement, Component, HostListener } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { html, when } from "@ayu-sh-kr/dota-wrap/rendering";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_START_PROJECT_FIELD_EVENT,
  PRICING_START_PROJECT_FIELDS,
  PRICING_START_PROJECT_FILES_EVENT,
  PRICING_START_PROJECT_MODE_EVENT,
  PRICING_START_PROJECT_PREVIEW_EVENT,
  type PricingStartProjectBrief,
  type PricingStartProjectFieldChange,
  type PricingStartProjectModeSelection,
} from "@app/events/pricing.events.ts";
import {
  createPricingStartProjectBrief,
  getPricingProjectBriefPreviewRows,
} from "@app/components/pages/pricing/start-project/project-preview/project-preview.utils.ts";
import { pricingFormService } from "@app/service/pricing-form/pricing-form.service.ts";

/**
 * Names the contact fields owned by the project-start shell rather than a focused branch form.
 *
 * The input listener narrows its `data-start-field` value to this union before changing the
 * retained brief, so a stray attribute cannot overwrite a different brief property.
 */
type SharedProjectField = "name" | "email" | "company";

/**
 * Names a shell-owned set of selectable values.
 *
 * These values are rendered into `data-start-choice` and validated by the click handler before
 * it applies a selection to the brief.
 */
type SharedProjectChoice = "existing" | "budget" | "timeline" | "next-step";

/**
 * Composes the pricing page's project-start experience from small focused elements.
 *
 * The selector above the form publishes {@link PRICING_START_PROJECT_MODE_EVENT}; this shell
 * renders exactly one matching spec, idea, or quote form. Those forms publish field updates
 * back to the shell, which preserves the complete brief, publishes snapshots to the independent
 * preview, validates shared questions, and prepares the explicit email handoff.
 *
 * Selector: `pricing-start-project`.
 */
@Component({
  selector: "pricing-start-project",
  shadow: false,
})
export class PricingStartProjectComponent extends BaseElement {
  /**
   * Complete local brief assembled from branch events and shell-owned controls.
   *
   * Keeping every branch's values here lets a visitor change form type without losing work and
   * gives the preview and email handoff one source of truth.
   */
  private brief: PricingStartProjectBrief = createPricingStartProjectBrief();

  /** Whether the validated brief should show its confirmation instead of editable controls. */
  private isPrepared = false;

  /** Whether a submission is currently in flight, blocking repeat submits. */
  private isSubmitting = false;

  /** Whether the last submission failed, so the form shows an error state instead of the handoff. */
  private isSubmitFailed = false;

  /** Backend-assigned id of the recorded brief, surfaced on the confirmation state. */
  private submissionId: number | null = null;

  /**
   * Event publisher used only to send brief snapshots to the independent preview component.
   *
   * The shell is the sole owner of mutable input state; the preview receives copies through this
   * facade and therefore cannot update the brief directly.
   */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Creates the shell; scoped lifecycle handling starts preview synchronisation after connection. */
  constructor() {
    super();
  }

  /**
   * Publishes the initial state once descendant components have connected.
   *
   * The preview has a local empty-state fallback for server rendering, then replaces it with this
   * shell-owned snapshot as soon as the interactive component tree is ready.
   */
  @OnEvent("connected", true)
  publishInitialPreview(): void {
    this.publishBrief();
  }

  /**
   * Replaces the branch form after the selector publishes a valid new mode.
   *
   * @param event - Selector event carrying one authored project starting point.
   */
  @OnEvent(PRICING_START_PROJECT_MODE_EVENT)
  renderSelectedProjectMode(event: ApplicationEvent<typeof PRICING_START_PROJECT_MODE_EVENT>): void {
    if (!this.isKnownMode(event.data)) {
      return;
    }

    this.brief.mode = event.data.mode;
    this.updateHTML();
    this.syncSharedChoiceButtons();
    this.publishBrief();
  }

  /**
   * Applies a changed field from the currently rendered branch form to the shared brief.
   *
   * @param event - Branch-form event containing the field name and latest visitor text.
   */
  @OnEvent(PRICING_START_PROJECT_FIELD_EVENT)
  updateBranchBrief(event: ApplicationEvent<typeof PRICING_START_PROJECT_FIELD_EVENT>): void {
    if (!this.isKnownBranchField(event.data)) {
      return;
    }

    this.brief[event.data.field] = event.data.value;
    this.publishBrief();
  }

  /**
   * Replaces the retained attachments after the attachment component's local list changes.
   *
   * @param event - Snapshot published whenever the attachment component adds, removes, or updates
   * the upload status of one of its locally owned files.
   */
  @OnEvent(PRICING_START_PROJECT_FILES_EVENT)
  updateBriefFiles(event: ApplicationEvent<typeof PRICING_START_PROJECT_FILES_EVENT>): void {
    this.brief.files = event.data.files;
    this.publishBrief();
  }

  /**
   * Handles shared pills and the edit action through one delegated host listener.
   *
   * @param event - Click from a shell-owned button inside the intake.
   */
  @HostListener({ event: "click" })
  handleSharedProjectClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!button || !this.contains(button)) {
      return;
    }

    if (button.dataset.startEdit !== undefined) {
      this.brief = createPricingStartProjectBrief();
      this.submissionId = null;
      this.isSubmitFailed = false;
      this.isPrepared = false;
      this.updateHTML();
      this.publishBrief();
      return;
    }

    const choice = button.dataset.startChoice;
    const value = button.dataset.startValue;
    if (
      !value
      || (choice !== "existing" && choice !== "budget" && choice !== "timeline" && choice !== "next-step")
    ) {
      return;
    }

    this.setSharedChoice(choice, value);
    this.updateHTML();
    this.syncSharedChoiceButtons();
    this.publishBrief();
  }

  /**
   * Stores shared contact text without re-rendering the active input control.
   *
   * @param event - Input from a shell-owned contact field.
   */
  @HostListener({ event: "input" })
  captureSharedProjectText(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) {
      return;
    }

    const fieldName = field.dataset.startField;
    if (fieldName !== "name" && fieldName !== "email" && fieldName !== "company") {
      return;
    }

    const key: SharedProjectField = fieldName;
    this.brief[key] = field.value;
    this.publishBrief();
  }

  /**
   * Captures the NDA selection from the shell-owned checkbox.
   *
   * @param event - Change from the NDA checkbox.
   */
  @HostListener({ event: "change" })
  captureSharedProjectChange(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement) || field.dataset.startNda === undefined) {
      return;
    }

    this.brief.needsNda = field.checked;
    this.publishBrief();
  }

  /**
   * Validates contact fields, submits the brief, and flips the shell into its confirmation state.
   *
   * The mailto fallback is kept for the failure path only; once the backend accepts a brief the
   * completion state shows the tracking id and skips the email handoff entirely.
   *
   * @param event - Submit event from the form that wraps the branch and shared fields.
   */
  @HostListener({ event: "submit" })
  async prepareBrief(event: SubmitEvent): Promise<void> {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "pricing-project-brief") {
      return;
    }

    event.preventDefault();
    if (this.isSubmitting || !form.checkValidity()) {
      if (!form.checkValidity()) {
        form.reportValidity();
      }
      return;
    }

    this.isSubmitting = true;
    this.isSubmitFailed = false;
    this.updateHTML();

    try {
      const { id } = await pricingFormService.submitBrief(this.brief);
      this.submissionId = id;
      this.isPrepared = true;
    } catch {
      this.isSubmitFailed = true;
    } finally {
      this.isSubmitting = false;
      this.updateHTML();
    }
  }

  /**
   * Checks that a mode-selection event still points at a mode authored for this intake.
   *
   * Events are typed at compile time but cross-component messages are still runtime input, so the
   * shell rejects stale or malformed mode IDs before it replaces the focused form.
   *
   * @param selection - Mode payload received from the selector component.
   * @returns Whether the payload names an authored project starting point.
   */
  private isKnownMode(selection: PricingStartProjectModeSelection): boolean {
    return pricingContent.startProject.modes.some((mode) => mode.id === selection.mode);
  }

  /**
   * Confirms that a branch event can update one of the branch-owned brief fields.
   *
   * The shell deliberately keeps shared contact and delivery inputs out of this event path.
   *
   * @param change - Field payload received from the currently rendered branch form.
   * @returns Whether the field belongs to one of the three branch forms.
   */
  private isKnownBranchField(change: PricingStartProjectFieldChange): boolean {
    return PRICING_START_PROJECT_FIELDS.includes(change.field);
  }

  /**
   * Applies one shell-owned choice to the brief.
   *
   * Existing capability choices are multi-select except for the exclusive “Nothing yet” option;
   * budget, timeline, and reply route are each a single-value toggle.
   *
   * @param choice - Shared choice group validated by the delegated click handler.
   * @param value - Authored option selected from that group.
   */
  private setSharedChoice(choice: SharedProjectChoice, value: string): void {
    if (choice === "existing") {
      if (value === pricingContent.startProject.form.emptyExistingOption) {
        this.brief.existing = this.brief.existing.includes(value) ? [] : [value];
        return;
      }

      const existing = this.brief.existing.filter((item) => item !== pricingContent.startProject.form.emptyExistingOption);
      this.brief.existing = existing.includes(value) ? existing.filter((item) => item !== value) : [...existing, value];
      return;
    }

    if (choice === "budget") {
      this.brief.budget = this.brief.budget === value ? "" : value;
      return;
    }

    if (choice === "timeline") {
      this.brief.timeline = this.brief.timeline === value ? "" : value;
      return;
    }

    this.brief.nextStep = value;
  }

  /**
   * Renders the child form for the selected starting point with its retained values.
   *
   * The child owns focused questions and publishes field changes; this shell only passes values
   * back in when a re-render replaces the child after a mode change.
   */
  private renderActiveProjectForm() {
    if (this.brief.mode === "spec") {
      return html`
        <pricing-project-spec-form
          project-name="${this.brief.projectName}"
          spec-link="${this.brief.specLink}"
          spec-notes="${this.brief.specNotes}"
        ></pricing-project-spec-form>
      `;
    }

    if (this.brief.mode === "idea") {
      return html`
        <pricing-project-idea-form
          idea="${this.brief.idea}"
          audience="${this.brief.audience}"
          success="${this.brief.success}"
        ></pricing-project-idea-form>
      `;
    }

    return html`
      <pricing-project-quote-form
        work-type="${this.brief.workType}"
        scope="${this.brief.scope}"
        constraints="${this.brief.constraints}"
      ></pricing-project-quote-form>
    `;
  }

  /**
   * Renders a shell-owned choice group with the current selection state.
   *
   * The same template supports the multi-select existing-capability group and the three
   * single-select groups while the click listener performs the corresponding update policy.
   *
   * @param options - Authored labels to offer in display order.
   * @param choice - Dataset identifier consumed by the delegated click handler.
   * @param selected - One selected value or the values selected in a multi-select group.
   */
  private renderSharedChoices(options: readonly string[], choice: SharedProjectChoice, selected: string | readonly string[]) {
    const selectedValues = typeof selected === "string" ? [selected] : selected;

    return html`
      <div class="pricing-project-choices" role="group">
        ${options.map((option) => html`
          <button
            class="pricing-project-choice ${selectedValues.includes(option) ? "is-selected" : ""}"
            type="button"
            data-start-choice="${choice}"
            data-start-value="${option}"
            aria-pressed="${selectedValues.includes(option)}"
          >
            ${option}
          </button>
        `)}
      </div>
    `;
  }

  /** Restores delegated choice metadata after a dynamic parent update. */
  private syncSharedChoiceButtons(): void {
    const groups: readonly [SharedProjectChoice, readonly string[], string | readonly string[]][] = [
      ["existing", pricingContent.startProject.existingOptions, this.brief.existing],
      ["budget", pricingContent.startProject.budgetOptions, this.brief.budget],
      ["timeline", pricingContent.startProject.timelineOptions, this.brief.timeline],
      ["next-step", pricingContent.startProject.nextSteps, this.brief.nextStep],
    ];

    this.querySelectorAll<HTMLDivElement>(".pricing-project-choices").forEach((group, index) => {
      const definition = groups[index];
      if (!definition) {
        return;
      }

      const [choice, options, selected] = definition;
      const selectedValues = typeof selected === "string" ? [selected] : selected;
      group.querySelectorAll<HTMLButtonElement>("button").forEach((button, optionIndex) => {
        const value = options[optionIndex];
        if (!value) {
          return;
        }

        const isSelected = selectedValues.includes(value);
        button.classList.add("pricing-project-choice");
        button.classList.toggle("is-selected", isSelected);
        button.dataset.startChoice = choice;
        button.dataset.startValue = value;
        button.setAttribute("aria-pressed", String(isSelected));
      });
    });
  }

  /**
   * Publishes an immutable snapshot after the shell changes its retained brief.
   *
   * The preview owns its own render cycle and listens for this event. Array fields are copied so a
   * later shell mutation cannot change a snapshot that is already in the event queue.
   */
  private publishBrief(): void {
    void this.publisher.publishAsync({
      name: PRICING_START_PROJECT_PREVIEW_EVENT,
      data: {
        ...this.brief,
        existing: [...this.brief.existing],
        files: [...this.brief.files],
      } satisfies PricingStartProjectBrief,
    });
  }

  /**
   * Builds the explicit mailto action from the same rows used by the visible preview.
   *
   * No submission occurs automatically: after validation, the completion state exposes this URL so
   * the visitor can review and send the prepared message in their mail client.
   *
   * @returns Encoded mailto URL containing the selected project subject and current brief rows.
   */
  private createEmailHref(): string {
    const body = getPricingProjectBriefPreviewRows(this.brief)
      .map((row) => `${row.label}: ${row.value || pricingContent.startProject.preview.emptyValue}`)
      .join("\n");
    const project = this.brief.projectName || this.brief.idea || this.brief.workType;
    const subject = project ? `${pricingContent.startProject.emailSubject}: ${project}` : pricingContent.startProject.emailSubject;

    return `mailto:${pricingContent.startProject.emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /**
   * Renders the project-start shell as either the editable intake or its prepared email handoff.
   *
   * The template reads only retained state and authored content. The preview is a separate leaf
   * component: brief events re-render it independently while choices, attachments, mode changes,
   * and submit transitions re-render this shell.
   */
  render() {
    const content = pricingContent.startProject;
    const form = content.form;

    return html`
      <section id="pricing-start-project" class="pricing-start-project-section" aria-labelledby="pricing-start-project-title">
        <div class="pricing-start-project-content layout-page">
          <pricing-start-project-intro></pricing-start-project-intro>
          <pricing-project-mode-selector selected-mode="${this.brief.mode}"></pricing-project-mode-selector>

          ${when(this.isPrepared, html`
            <div class="pricing-project-complete" role="status">
              <span aria-hidden="true">✓</span>
              <h3>${content.completionTitle}</h3>
              <p>
                ${content.completionBody}
                ${this.submissionId !== null ? `${content.completionReferencePrefix} #${this.submissionId}.` : ""}
              </p>
              <div>
                <button class="pricing-project-secondary-button" type="button" data-start-edit>
                  ${form.submitAnotherLabel}
                </button>
              </div>
            </div>
          `, html`
            <div class="pricing-project-workspace">
              <form id="pricing-project-brief" class="pricing-project-form">
                ${this.renderActiveProjectForm()}

                <fieldset class="pricing-project-fieldset">
                  <legend>${form.shapeLegend}</legend>
                  <div class="pricing-project-input-label">
                    ${form.existingLabel} <small>${form.existingHint}</small>
                  </div>
                  ${this.renderSharedChoices(content.existingOptions, "existing", this.brief.existing)}

                  <div class="pricing-project-input-label">${form.budgetLabel}</div>
                  ${this.renderSharedChoices(content.budgetOptions, "budget", this.brief.budget)}

                  <div class="pricing-project-input-label">${form.timelineLabel}</div>
                  ${this.renderSharedChoices(content.timelineOptions, "timeline", this.brief.timeline)}

                  <pricing-project-file-upload files="${JSON.stringify(this.brief.files)}"></pricing-project-file-upload>
                </fieldset>

                <fieldset class="pricing-project-fieldset">
                  <legend>${form.contactLegend}</legend>
                  <div class="pricing-project-field-grid">
                    <label>
                      ${form.nameLabel}
                      <input data-start-field="name" value="${this.brief.name}" autocomplete="name" required placeholder="${form.namePlaceholder}">
                    </label>
                    <label>
                      ${form.emailLabel}
                      <input data-start-field="email" value="${this.brief.email}" type="email" autocomplete="email" required placeholder="${form.emailPlaceholder}">
                    </label>
                  </div>

                  <div class="pricing-project-field-grid">
                    <label>
                      ${form.companyLabel} <small>${form.optionalLabel}</small>
                      <input data-start-field="company" value="${this.brief.company}" autocomplete="organization" placeholder="${form.companyPlaceholder}">
                    </label>
                    <div>
                      <div class="pricing-project-input-label">${form.nextStepLabel}</div>
                      ${this.renderSharedChoices(content.nextSteps, "next-step", this.brief.nextStep)}
                    </div>
                  </div>

                  <label class="pricing-project-checkbox">
                    ${when(this.brief.needsNda, html`<input data-start-nda type="checkbox" checked>`, html`<input data-start-nda type="checkbox">`)}
                    <span>${form.ndaLabel}</span>
                  </label>
                </fieldset>

                <div class="pricing-project-submit">
                  ${when(this.isSubmitFailed, html`
                    <p class="pricing-project-submit-error" role="alert">
                      ${form.submitErrorNote}
                      <a href="${this.createEmailHref()}">${form.submitErrorEmailLabel}</a>
                    </p>
                  `, html`<p>${form.submitNote}</p>`)}
                  <button class="pricing-project-primary-button" type="submit" ${this.isSubmitting ? "disabled" : ""}>
                    ${this.isSubmitting ? form.submittingLabel : form.submitLabel} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>

              <pricing-project-preview></pricing-project-preview>
            </div>
          `)}
        </div>
      </section>
    `;
  }
}
