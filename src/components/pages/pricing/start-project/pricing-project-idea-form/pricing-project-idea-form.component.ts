import { ApplicationEventService, BaseElement, Component, HostListener, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import {
  PRICING_START_PROJECT_FIELD_EVENT,
  type PricingStartProjectField,
} from "@app/events/pricing.events.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/**
 * Collects the outcome-focused questions for a visitor with an early-stage idea.
 *
 * It is rendered only when the mode selector publishes `idea`. Field events keep
 * the parent shell's preview and generated email current without this component
 * knowing about any other part of the intake.
 *
 * Selector: `pricing-project-idea-form`.
 */
@Component({
  selector: "pricing-project-idea-form",
  shadow: false,
})
export class PricingProjectIdeaFormComponent extends BaseElement {
  /** One-line project purpose. Attribute `idea`; defaults to an empty value. */
  @Property({ name: "idea", type: String })
  idea = "";

  /** Intended users. Attribute `audience`; defaults to an empty value. */
  @Property({ name: "audience", type: String })
  audience = "";

  /** Measurable outcome. Attribute `success`; defaults to an empty value. */
  @Property({ name: "success", type: String })
  success = "";

  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Initialises the declarative form component. */
  constructor() {
    super();
  }

  /**
   * Publishes a changed idea field for the parent-owned project brief.
   *
   * @param event - Input from one of the three idea fields.
   */
  @HostListener({ event: "input" })
  publishIdeaField(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      return;
    }

    const key = field.dataset.projectField as PricingStartProjectField | undefined;
    if (!key || !["idea", "audience", "success"].includes(key)) {
      return;
    }

    void this.publisher.publishAsync({
      name: PRICING_START_PROJECT_FIELD_EVENT,
      data: { field: key, value: field.value },
    });
  }

  /** Renders the product purpose, intended audience, and success fields for an idea. */
  render(): string {
    return HTML`
      <fieldset class="pricing-project-fieldset">
        <legend>The idea</legend>
        <label>In one line, what should it do?<input data-project-field="idea" value="${escapeHtml(this.idea)}" placeholder="Let staff take orders without a POS terminal"></label>
        <label>Who is it for?<input data-project-field="audience" value="${escapeHtml(this.audience)}" placeholder="Floor staff, currently on pen and paper"></label>
        <label>What does success look like?<textarea data-project-field="success" placeholder="In three months, what is measurably different?">${escapeHtml(this.success)}</textarea></label>
      </fieldset>
    `;
  }
}
