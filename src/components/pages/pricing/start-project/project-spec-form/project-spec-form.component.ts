import { ApplicationEventService, BaseElement, Component, HostListener, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import {
  PRICING_START_PROJECT_FIELD_EVENT,
  type PricingStartProjectField,
} from "@app/events/pricing.events.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/**
 * Collects the details that supplement an existing project specification.
 *
 * The project-start shell renders this component for the `spec` selection. Each
 * field publishes {@link PRICING_START_PROJECT_FIELD_EVENT}, leaving the shell to
 * own the complete brief, live preview, and final email action.
 *
 * Selector: `pricing-project-spec-form`.
 */
@Component({
  selector: "pricing-project-spec-form",
  shadow: false,
})
export class PricingProjectSpecFormComponent extends BaseElement {
  /** Project name. Attribute `project-name`; defaults to an empty value. */
  @Property({ name: "project-name", type: String })
  projectName = "";

  /** Specification URL. Attribute `spec-link`; defaults to an empty value. */
  @Property({ name: "spec-link", type: String })
  specLink = "";

  /** Context omitted from the specification. Attribute `spec-notes`; defaults to an empty value. */
  @Property({ name: "spec-notes", type: String })
  specNotes = "";

  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Initialises the declarative form component. */
  constructor() {
    super();
  }

  /**
   * Publishes a changed specification field for the parent-owned project brief.
   *
   * @param event - Input from one of the three specification fields.
   */
  @HostListener({ event: "input" })
  publishSpecField(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      return;
    }

    const key = field.dataset.projectField as PricingStartProjectField | undefined;
    if (!key || !["projectName", "specLink", "specNotes"].includes(key)) {
      return;
    }

    void this.publisher.publishAsync({
      name: PRICING_START_PROJECT_FIELD_EVENT,
      data: { field: key, value: field.value },
    });
  }

  /** Renders the project name, document link, and missing-context fields for a spec. */
  render(): string {
    return HTML`
      <fieldset class="pricing-project-fieldset">
        <legend>The build</legend>
        <label class="form-label form-label">Project name<input class="form-control input-md input-rounded-md input-bordered" data-project-field="projectName" value="${escapeHtml(this.projectName)}" placeholder="Orders API v2"></label>
        <label class="form-label form-label">Link to the spec <small>Optional</small><input class="form-control input-md input-rounded-md input-bordered" data-project-field="specLink" type="url" value="${escapeHtml(this.specLink)}" placeholder="https://notion.so/…"></label>
        <label class="form-label form-label">What the doc will not tell me<textarea class="form-control input-md input-rounded-md input-bordered" data-project-field="specNotes" placeholder="The part you are least sure about.">${escapeHtml(this.specNotes)}</textarea></label>
      </fieldset>
    `;
  }
}
