import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Offers a calm handoff from existing-client support to new project inquiries.
 *
 * The support page renders this after the answers-first flow. It owns only the
 * project CTA presentation; pricing and email destinations remain authored in
 * `supportContent`, so changing the route does not require editing markup.
 *
 * Selector: `support-start-project`.
 */
@Component({
  selector: "support-start-project",
  shadow: false,
})
export class SupportStartProjectComponent extends BaseElement {
  /** Initializes the stateless handoff; copy and destinations are read during render. */
  constructor() {
    super();
  }

  /** Renders the new-work handoff using support content and semantic theme tokens. */
  render(): string {
    const content = supportContent.startProject;

    return HTML`
      <section id="start-project" class="support-start-project layout-page layout-section-end" aria-labelledby="start-project-title">
        <div class="support-start-project-panel">
          <div>
            <p class="support-start-project-eyebrow">${content.eyebrow}</p>
            <h2 id="start-project-title" class="support-start-project-title type-section">
              ${content.titleBeforeAccent} <span>${content.titleAccent}</span> ${content.titleAfterAccent}
            </h2>
            <p class="support-start-project-body">${content.body}</p>
          </div>

          <div class="support-start-project-actions">
            <a class="support-start-project-primary" href="${content.primaryHref}">
              ${content.primaryLabel} <span aria-hidden="true">→</span>
            </a>
            <a class="support-start-project-secondary" href="${content.secondaryHref}">${content.secondaryLabel}</a>
            <p class="support-start-project-note">${content.note}</p>
          </div>
        </div>
      </section>
    `;
  }
}
