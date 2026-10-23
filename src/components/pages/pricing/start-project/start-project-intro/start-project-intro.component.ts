import "./start-project-intro.component.css";
import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { pricingContent } from "@app/data/pricing-content.ts";

/**
 * Renders the left-aligned introduction for the pricing project-intake section.
 *
 * The project-start shell places this element before the mode selector. Copy and
 * availability facts come from `pricingContent.startProject`, while the element's
 * own stylesheet keeps its alignment independent from the interactive intake below.
 *
 * Selector: `pricing-start-project-intro`.
 */
@Component({
  selector: "pricing-start-project-intro",
  shadow: false,
})
export class PricingStartProjectIntroComponent extends BaseElement {
  /** Initialises the presentational intro component. */
  constructor() {
    super();
  }

  /** Returns the authored project-start heading, description, and availability facts. */
  render(): TemplateResult {
    const content = pricingContent.startProject;

    return html`
      <header class="pricing-start-project-intro">
        <p class="pricing-eyebrow">${content.eyebrow}</p>
        <h2 id="pricing-start-project-title">
          ${content.titleBeforeAccent} <span>${content.titleAccent}</span>
        </h2>
        <p>${content.body}</p>
        <ul class="pricing-start-project-facts">
          ${content.availability.map((item) => html`<li>${item}</li>`)}
        </ul>
      </header>
    `;
  }
}
