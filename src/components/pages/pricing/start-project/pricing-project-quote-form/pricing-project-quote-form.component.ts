import { ApplicationEventService, BaseElement, Component, HostListener, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_START_PROJECT_FIELD_EVENT,
  type PricingStartProjectField,
} from "@app/events/pricing.events.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/**
 * Collects a settled quote request: work category, scope, and technical constraints.
 *
 * The mode selector causes the project-start shell to render this element for `quote`.
 * It publishes its local changes and leaves the shared timing, budget, contact, and
 * preview concerns with the shell.
 *
 * Selector: `pricing-project-quote-form`.
 */
@Component({
  selector: "pricing-project-quote-form",
  shadow: false,
})
export class PricingProjectQuoteFormComponent extends BaseElement {
  /** Selected work category. Attribute `work-type`; defaults to an empty value. */
  @Property({ name: "work-type", type: String })
  workType = "";

  /** Requested work scope. Attribute `scope`; defaults to an empty value. */
  @Property({ name: "scope", type: String })
  scope = "";

  /** Technical or delivery constraints. Attribute `constraints`; defaults to an empty value. */
  @Property({ name: "constraints", type: String })
  constraints = "";

  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Initialises the declarative form component. */
  constructor() {
    super();
  }

  /**
   * Publishes the selected work type after the visitor activates one of its pills.
   *
   * @param event - Click from a work-type pill rendered by this quote form.
   */
  @HostListener({ event: "click" })
  selectWorkType(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-project-work-type]");
    const workType = button?.dataset.projectWorkType;
    if (!button || !this.contains(button) || !workType) {
      return;
    }

    this.workType = this.workType === workType ? "" : workType;
    this.updateHTML();
    this.publishField("workType", this.workType);
  }

  /**
   * Publishes a changed quote text field for the parent-owned project brief.
   *
   * @param event - Input from the scope or constraints field.
   */
  @HostListener({ event: "input" })
  publishQuoteField(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      return;
    }

    const key = field.dataset.projectField as PricingStartProjectField | undefined;
    if (!key || !["scope", "constraints"].includes(key)) {
      return;
    }

    this.publishField(key, field.value);
  }

  /**
   * Sends one branch-field value to the project-start shell.
   *
   * @param field - Quote field that changed in this component.
   * @param value - Visitor-supplied value for that field.
   */
  private publishField(field: PricingStartProjectField, value: string): void {
    void this.publisher.publishAsync({
      name: PRICING_START_PROJECT_FIELD_EVENT,
      data: { field, value },
    });
  }

  /** Renders the work-type pills and quote-detail fields. */
  render(): string {
    return HTML`
      <fieldset class="pricing-project-fieldset">
        <legend>The work</legend>
        <div class="pricing-project-input-label">What kind of work is it?</div>
        <div class="pricing-project-choices" role="group">
          ${pricingContent.startProject.workTypes.map((option) => `
            <button class="pricing-project-choice ${option === this.workType ? "is-selected" : ""}" type="button" data-project-work-type="${escapeHtml(option)}" aria-pressed="${option === this.workType}">${escapeHtml(option)}</button>
          `).join("")}
        </div>
        <label>What is in scope?<textarea data-project-field="scope" placeholder="Everything that has to exist for this to be done. Bullets are fine.">${escapeHtml(this.scope)}</textarea></label>
        <label>Stack and constraints <small>Optional</small><input data-project-field="constraints" value="${escapeHtml(this.constraints)}" placeholder="Postgres, AWS, must stay in eu-west-1"></label>
      </fieldset>
    `;
  }
}
