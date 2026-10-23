import "./support-intro.component.css";
import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Renders the static introduction to the support help flow.
 *
 * It is the first child of {@link SupportSectionComponent}. The content is read
 * from `supportContent.opener`, so copy edits do not require touching the parent
 * shell or either interactive support component.
 *
 * Selector: `support-intro`.
 */
@Component({ selector: "support-intro", shadow: false })
export class SupportIntroComponent extends BaseElement {
  /** Creates the stateless introduction element. */
  constructor() {
    super();
  }

  /** Returns the authored eyebrow, heading, and introductory lede. */
  render(): TemplateResult {
    const { opener } = supportContent;

    return html`
      <header class="support-head">
        <p class="support-eyebrow type-eyebrow">${opener.eyebrow}</p>
        <h2 id="support-title" class="type-section">
          ${opener.titleBeforeAccent}
          <span class="support-accent">${opener.titleAccent}</span> ${opener.titleAfterAccent}
        </h2>
        <p class="support-lede type-lede">${opener.lede}</p>
      </header>
    `;
  }
}
