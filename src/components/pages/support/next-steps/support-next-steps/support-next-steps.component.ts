import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Makes the support reply process visible after the contact form.
 *
 * This static band maps the authored sequence in `supportContent.nextSteps` into
 * four concise commitments, so the form never feels like a black-box handoff.
 *
 * Selector: `support-next-steps`.
 */
@Component({ selector: "support-next-steps", shadow: false })
export class SupportNextStepsComponent extends BaseElement {
  /** Creates the stateless timeline element. */
  constructor() { super(); }

  /** Renders the message-to-resolution sequence from the support content source. */
  render(): string {
    return HTML`
      <section id="next" class="support-next-steps layout-section" aria-labelledby="support-next-title">
        <div class="support-next-inner layout-page">
          <div class="support-next-heading">
            <p class="support-eyebrow">After you send</p>
            <h2 id="support-next-title" class="support-section-title">No black box.</h2>
            <p>Here is the actual path a message takes, so you know when to expect what — and when to nudge me.</p>
          </div>
          <ol class="support-steps">
            ${supportContent.nextSteps.map((step) => `
              <li class="support-step">
                <span class="support-step-number">${step.number}</span>
                <h3>${step.title}</h3>
                <p>${step.body}</p>
                <span class="support-step-when">${step.when}</span>
              </li>`).join("")}
          </ol>
        </div>
      </section>
    `;
  }
}
