import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { type ApplicationEvent, OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_START_PROJECT_PREVIEW_EVENT,
  type PricingStartProjectBrief,
} from "@app/events/pricing.events.ts";
import {
  createPricingStartProjectBrief,
  getPricingProjectBriefPreviewRows,
  getPricingProjectBriefProgress,
  getPricingProjectBriefProgressLabel,
} from "./project-preview.utils.ts";

/**
 * Displays the live summary of the pricing project-start brief.
 *
 * The start-project shell owns input state and publishes complete brief snapshots through
 * {@link PRICING_START_PROJECT_PREVIEW_EVENT}. This component listens for those snapshots, updates
 * its local render state, and never reaches into the form or changes its values itself.
 *
 * Selector: `pricing-project-preview`.
 */
@Component({
  selector: "pricing-project-preview",
  shadow: false,
})
export class PricingProjectPreviewComponent extends BaseElement {
  /** Latest brief snapshot received from the project-start shell. */
  private brief: PricingStartProjectBrief = createPricingStartProjectBrief();

  /** Creates the preview before it starts listening for shell-owned brief snapshots. */
  constructor() {
    super();
  }

  /**
   * Re-renders the preview after the shell publishes a changed brief snapshot.
   *
   * The event is the only update path after initial rendering, keeping the preview independent of
   * the input component's DOM and preserving a one-way data flow from shell to leaf component.
   *
   * @param event - Snapshot event published after a project-start input, choice, or mode changes.
   */
  @OnEvent(PRICING_START_PROJECT_PREVIEW_EVENT)
  renderBrief(event: ApplicationEvent<typeof PRICING_START_PROJECT_PREVIEW_EVENT>): void {
    this.brief = event.data;
    this.updateHTML();
  }

  /**
   * Renders the progress meter and all current brief facts from the latest snapshot.
   *
   * The shell uses the same row builder for its mailto handoff, so the visitor-visible summary and
   * prepared email remain aligned.
   */
  render() {
    const content = pricingContent.startProject;
    const preview = content.preview;
    const rows = getPricingProjectBriefPreviewRows(this.brief);
    const percentage = getPricingProjectBriefProgress(rows);
    const progressLabel = getPricingProjectBriefProgressLabel(percentage);

    return html`
      <aside class="pricing-project-preview" aria-label="${preview.ariaLabel}">
        <div>
          <h3>${preview.title}</h3>
          <p>${preview.body}</p>
          <div class="pricing-project-meter" style="--project-brief-progress: ${percentage}%">
            <i></i>
          </div>
          <p class="pricing-project-meter-copy">
            <span>${progressLabel}</span>
            <b>${percentage}%</b>
          </p>
        </div>

        <dl>
          ${rows.map((row) => html`
            <div>
              <dt>${row.label}</dt>
              <dd class="${row.value ? "" : "is-empty"}">${row.value || preview.emptyValue}</dd>
            </div>
          `)}
        </dl>
        <p class="pricing-project-preview-foot">
          ${preview.regularEmailPrefix} <a href="mailto:${content.emailAddress}">${content.emailAddress}</a>
        </p>
      </aside>
    `;
  }
}
