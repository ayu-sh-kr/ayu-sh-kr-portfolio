import { BaseElement, Component, HostListener, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_START_PROJECT_FIELD_EVENT,
  PRICING_START_PROJECT_FIELDS,
  PRICING_START_PROJECT_MODE_EVENT,
  type PricingStartProjectField,
  type PricingStartProjectFieldChange,
  type PricingStartProjectMode,
  type PricingStartProjectModeSelection,
} from "@app/events/pricing.events.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/** Names the text fields shared by every project starting point. */
type SharedProjectField = "name" | "email" | "company";

/**
 * The project information retained by the pricing page while a visitor completes the intake.
 *
 * Branch form components own their focused questions and publish changes into this model. The
 * shell owns the shared fields, preview, and prepared email so a mode change never destroys a
 * value collected in another branch.
 */
interface ProjectBrief {
  /** Current branch selected by {@link PRICING_START_PROJECT_MODE_EVENT}. */
  mode: PricingStartProjectMode;
  /** Project name supplied with an existing specification. */
  projectName: string;
  /** Existing specification URL. */
  specLink: string;
  /** Context that the specification does not capture. */
  specNotes: string;
  /** One-line purpose supplied by an idea-stage visitor. */
  idea: string;
  /** People who should benefit from the proposed work. */
  audience: string;
  /** Outcome that defines success for an idea. */
  success: string;
  /** Work category selected for a quote request. */
  workType: string;
  /** Work that must be included in a quote. */
  scope: string;
  /** Optional technical or delivery constraints. */
  constraints: string;
  /** Existing project assets or capabilities selected by the visitor. */
  existing: string[];
  /** Budget range selected from pricing-aligned choices. */
  budget: string;
  /** Delivery timing selected by the visitor. */
  timeline: string;
  /** Local attachment names shown in the preview and prepared email. */
  files: string[];
  /** Required sender name. */
  name: string;
  /** Required sender email. */
  email: string;
  /** Optional sender organisation. */
  company: string;
  /** Preferred reply route. */
  nextStep: string;
  /** Whether the visitor needs an NDA before sharing additional material. */
  needsNda: boolean;
}

/**
 * Composes the pricing page's project-start experience from small focused elements.
 *
 * The selector above the form publishes {@link PRICING_START_PROJECT_MODE_EVENT}; this shell
 * renders exactly one matching spec, idea, or quote form. Those forms publish field updates
 * back to the shell, which preserves the complete brief and handles shared questions, preview,
 * validation, and the explicit email handoff.
 *
 * Selector: `pricing-start-project`.
 */
@Component({
  selector: "pricing-start-project",
  shadow: false,
})
export class PricingStartProjectComponent extends BaseElement {
  /** Complete local brief assembled from branch events and shared form controls. */
  private brief: ProjectBrief = {
    mode: "spec",
    projectName: "",
    specLink: "",
    specNotes: "",
    idea: "",
    audience: "",
    success: "",
    workType: "",
    scope: "",
    constraints: "",
    existing: [],
    budget: "",
    timeline: "",
    files: [],
    name: "",
    email: "",
    company: "",
    nextStep: pricingContent.startProject.nextSteps[0],
    needsNda: false,
  };

  /** Controls whether the editable intake or the final email handoff is displayed. */
  private isPrepared = false;

  /** Initialises the shell; all DOM interaction is expressed with scoped decorators. */
  constructor() {
    super();
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
    this.updatePreview();
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
      this.isPrepared = false;
      this.updateHTML();
      return;
    }

    const choice = button.dataset.startChoice;
    const value = button.dataset.startValue;
    if (!choice || !value) {
      return;
    }

    this.setSharedChoice(choice, value);
    this.updateHTML();
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

    const key = field.dataset.startField as SharedProjectField | undefined;
    if (!key) {
      return;
    }

    this.brief[key] = field.value;
    this.updatePreview();
  }

  /**
   * Captures the NDA selection and attachment names from shell-owned inputs.
   *
   * @param event - Change from the checkbox or attachment picker.
   */
  @HostListener({ event: "change" })
  captureSharedProjectChange(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) {
      return;
    }

    if (field.dataset.startNda !== undefined) {
      this.brief.needsNda = field.checked;
      this.updatePreview();
      return;
    }

    if (field.dataset.startFiles === undefined) {
      return;
    }

    this.brief.files = Array.from(field.files ?? [])
      .filter((file) => file.size <= 20 * 1024 * 1024)
      .slice(0, 8)
      .map((file) => file.name);
    this.updateHTML();
  }

  /**
   * Validates contact fields and exposes the explicit static-site email handoff.
   *
   * @param event - Submit event from the form that wraps the branch and shared fields.
   */
  @HostListener({ event: "submit" })
  prepareBrief(event: SubmitEvent): void {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "pricing-project-brief") {
      return;
    }

    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    this.isPrepared = true;
    this.updateHTML();
  }

  /** Validates a selector event against the three modes authored in pricing content. */
  private isKnownMode(selection: PricingStartProjectModeSelection): boolean {
    return pricingContent.startProject.modes.some((mode) => mode.id === selection.mode);
  }

  /** Validates that a branch event names a field owned by a branch form. */
  private isKnownBranchField(change: PricingStartProjectFieldChange): boolean {
    return PRICING_START_PROJECT_FIELDS.includes(change.field);
  }

  /** Applies a shared-pill selection, including the exclusive “Nothing yet” option. */
  private setSharedChoice(choice: string, value: string): void {
    if (choice === "existing") {
      if (value === "Nothing yet") {
        this.brief.existing = this.brief.existing.includes(value) ? [] : [value];
        return;
      }

      const existing = this.brief.existing.filter((item) => item !== "Nothing yet");
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

    if (choice === "next-step") {
      this.brief.nextStep = value;
    }
  }

  /** Renders the one focused child form selected through the mode-selector event flow. */
  private renderActiveProjectForm(): string {
    if (this.brief.mode === "spec") {
      return `<pricing-project-spec-form project-name="${escapeHtml(this.brief.projectName)}" spec-link="${escapeHtml(this.brief.specLink)}" spec-notes="${escapeHtml(this.brief.specNotes)}"></pricing-project-spec-form>`;
    }

    if (this.brief.mode === "idea") {
      return `<pricing-project-idea-form idea="${escapeHtml(this.brief.idea)}" audience="${escapeHtml(this.brief.audience)}" success="${escapeHtml(this.brief.success)}"></pricing-project-idea-form>`;
    }

    return `<pricing-project-quote-form work-type="${escapeHtml(this.brief.workType)}" scope="${escapeHtml(this.brief.scope)}" constraints="${escapeHtml(this.brief.constraints)}"></pricing-project-quote-form>`;
  }

  /** Renders an authored shared pill group with its current selected values. */
  private renderSharedChoices(options: readonly string[], choice: string, selected: string | readonly string[]): string {
    const selectedValues = typeof selected === "string" ? [selected] : selected;

    return HTML`
      <div class="pricing-project-choices" role="group">
        ${options.map((option) => `
          <button class="pricing-project-choice ${selectedValues.includes(option) ? "is-selected" : ""}" type="button" data-start-choice="${choice}" data-start-value="${escapeHtml(option)}" aria-pressed="${selectedValues.includes(option)}">${escapeHtml(option)}</button>
        `).join("")}
      </div>
    `;
  }

  /** Returns the source-of-truth rows shared by the live preview and prepared email body. */
  private getPreviewRows(): Array<{ label: string; value: string }> {
    const mode = pricingContent.startProject.modes.find((item) => item.id === this.brief.mode);
    const project = this.brief.mode === "spec" ? this.brief.projectName : this.brief.mode === "idea" ? this.brief.idea : this.brief.workType;
    const detail = this.brief.mode === "spec"
      ? [this.brief.specLink, this.brief.specNotes].filter(Boolean).join(" · ")
      : this.brief.mode === "idea"
        ? [this.brief.audience && `For ${this.brief.audience}`, this.brief.success && `Success: ${this.brief.success}`].filter(Boolean).join(" · ")
        : [this.brief.scope, this.brief.constraints].filter(Boolean).join(" · ");

    return [
      { label: "Bringing", value: mode?.label ?? "" },
      { label: "Project", value: project },
      { label: "The gist", value: detail },
      { label: "Stands at", value: this.brief.existing.join(", ") },
      { label: "Budget", value: this.brief.budget },
      { label: "Timeline", value: this.brief.timeline },
      { label: "Attached", value: this.brief.files.join(", ") },
      { label: "From", value: [this.brief.name, this.brief.company].filter(Boolean).join(" · ") },
      { label: "Reply to", value: this.brief.email },
      { label: "Next step", value: `${this.brief.nextStep}${this.brief.needsNda ? " · NDA first" : ""}` },
    ];
  }

  /** Updates the live preview without interrupting focus in a text input. */
  private updatePreview(): void {
    const rows = this.getPreviewRows();
    rows.forEach((row) => {
      const value = this.querySelector<HTMLElement>(`[data-preview-value="${row.label}"]`);
      if (!value) {
        return;
      }

      value.textContent = row.value || "—";
      value.classList.toggle("is-empty", !row.value);
    });

    const percentage = Math.round((rows.filter((row) => row.value).length / rows.length) * 100);
    this.querySelector<HTMLElement>("[data-project-meter]")?.style.setProperty("--project-brief-progress", `${percentage}%`);
    const meterValue = this.querySelector<HTMLElement>("[data-project-meter-value]");
    if (meterValue) {
      meterValue.textContent = `${percentage}%`;
    }

    const meterLabel = this.querySelector<HTMLElement>("[data-project-meter-label]");
    if (meterLabel) {
      meterLabel.textContent = percentage < 35 ? "A few useful questions" : percentage < 70 ? "A useful starting point" : "Ready for a first read";
    }
  }

  /** Builds the explicit email action from the same values visible in the project preview. */
  private createEmailHref(): string {
    const body = this.getPreviewRows().map((row) => `${row.label}: ${row.value || "—"}`).join("\n");
    const project = this.brief.projectName || this.brief.idea || this.brief.workType;
    const subject = project ? `${pricingContent.startProject.emailSubject}: ${project}` : pricingContent.startProject.emailSubject;

    return `mailto:${pricingContent.startProject.emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /** Renders the composed intake shell, its independently focused forms, and final handoff. */
  render(): string {
    const content = pricingContent.startProject;
    const previewRows = this.getPreviewRows();
    const percentage = Math.round((previewRows.filter((row) => row.value).length / previewRows.length) * 100);

    return HTML`
      <section id="pricing-start-project" class="pricing-start-project-section" aria-labelledby="pricing-start-project-title">
        <div class="pricing-start-project-content layout-page">
          <pricing-start-project-intro></pricing-start-project-intro>
          <pricing-project-mode-selector selected-mode="${this.brief.mode}"></pricing-project-mode-selector>

          ${this.isPrepared ? HTML`
            <div class="pricing-project-complete" role="status">
              <span aria-hidden="true">✓</span><h3>${content.completionTitle}</h3>
              <p>${content.completionBody}${this.brief.files.length ? " Add the selected files to that email before sending." : ""}</p>
              <div><a class="pricing-project-primary-button" href="${escapeHtml(this.createEmailHref())}">${content.emailLabel} <span aria-hidden="true">→</span></a><button class="pricing-project-secondary-button" type="button" data-start-edit>Edit the brief</button></div>
            </div>
          ` : HTML`
            <div class="pricing-project-workspace">
              <form id="pricing-project-brief" class="pricing-project-form">
                ${this.renderActiveProjectForm()}
                <fieldset class="pricing-project-fieldset">
                  <legend>Shape of it</legend>
                  <div class="pricing-project-input-label">Where things stand <small>Pick any</small></div>
                  ${this.renderSharedChoices(content.existingOptions, "existing", this.brief.existing)}
                  <div class="pricing-project-input-label">Budget</div>
                  ${this.renderSharedChoices(content.budgetOptions, "budget", this.brief.budget)}
                  <div class="pricing-project-input-label">Timeline</div>
                  ${this.renderSharedChoices(content.timelineOptions, "timeline", this.brief.timeline)}
                  <label class="pricing-project-file-input">Attachments <small>Up to 20 MB each · optional</small><input data-start-files type="file" multiple><span>Choose files to include in your brief</span></label>
                  <p class="pricing-project-files" aria-live="polite">${this.brief.files.length ? this.brief.files.map(escapeHtml).join(" · ") : "No attachments selected"}</p>
                </fieldset>
                <fieldset class="pricing-project-fieldset">
                  <legend>You</legend>
                  <div class="pricing-project-field-grid"><label>Your name<input data-start-field="name" value="${escapeHtml(this.brief.name)}" autocomplete="name" required placeholder="Priya Raghavan"></label><label>Email<input data-start-field="email" value="${escapeHtml(this.brief.email)}" type="email" autocomplete="email" required placeholder="you@company.com"></label></div>
                  <div class="pricing-project-field-grid"><label>Company <small>Optional</small><input data-start-field="company" value="${escapeHtml(this.brief.company)}" autocomplete="organization" placeholder="Northwind Foods"></label><div><div class="pricing-project-input-label">Best next step</div>${this.renderSharedChoices(content.nextSteps, "next-step", this.brief.nextStep)}</div></div>
                  <label class="pricing-project-checkbox"><input data-start-nda type="checkbox" ${this.brief.needsNda ? "checked" : ""}><span>I need an NDA first. Send yours, or I will send mine.</span></label>
                </fieldset>
                <div class="pricing-project-submit"><p>This creates one email. Nothing is sent automatically.</p><button class="pricing-project-primary-button" type="submit">Prepare the brief <span aria-hidden="true">→</span></button></div>
              </form>
              <aside class="pricing-project-preview" aria-label="Project brief preview">
                <div><h3>${content.previewTitle}</h3><p>${content.previewBody}</p><div class="pricing-project-meter" data-project-meter style="--project-brief-progress: ${percentage}%"><i></i></div><p class="pricing-project-meter-copy"><span data-project-meter-label>${percentage < 35 ? "A few useful questions" : percentage < 70 ? "A useful starting point" : "Ready for a first read"}</span><b data-project-meter-value>${percentage}%</b></p></div>
                <dl>${previewRows.map((row) => `<div><dt>${row.label}</dt><dd data-preview-value="${row.label}" class="${row.value ? "" : "is-empty"}">${escapeHtml(row.value || "—")}</dd></div>`).join("")}</dl>
                <p class="pricing-project-preview-foot">Prefer a regular email? <a href="mailto:${content.emailAddress}">${content.emailAddress}</a></p>
              </aside>
            </div>
          `}
          <pricing-project-process></pricing-project-process>
          <pricing-project-alternatives></pricing-project-alternatives>
        </div>
      </section>
    `;
  }
}
