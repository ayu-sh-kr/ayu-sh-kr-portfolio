import "./showcase-working-method.component.css";
import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { showcaseSupport } from "@app/data/showcase-content.ts";

/**
 * Presents the authored working-method principles used in the support section.
 *
 * The content model owns numbering and copy; this component only maps each way
 * of working to a consistent article, preserving a single source of truth.
 *
 * Selector: `showcase-working-method`.
 */
@Component({
  selector: "showcase-working-method",
  shadow: false,
})
export class ShowcaseWorkingMethodComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders each working-method principle as a revealable article. */
  render(): TemplateResult {
    return html`
      <div class="showcase-support-work-grid">
        ${showcaseSupport.waysOfWorking.map(
          (way) => html`
            <article class="showcase-support-way showcase-reveal" data-showcase-reveal>
              <span class="showcase-support-number">${way.number}</span>
              <h2 class="mt-6">${way.title}</h2>
              <p class="mt-4">${way.body}</p>
            </article>
          `
        )}
      </div>
    `;
  }
}
