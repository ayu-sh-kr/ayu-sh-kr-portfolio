import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Lists the self-serve documentation and status destinations that precede a support request.
 *
 * Each row is driven by `supportContent.resources`, keeping destination changes and support
 * copy out of the page shell while this component owns the row presentation.
 *
 * Selector: `support-resources`.
 */
@Component({ selector: "support-resources", shadow: false })
export class SupportResourcesComponent extends BaseElement {
  /** Creates the stateless resource shelf element. */
  constructor() { super(); }

  /** Renders the authored self-serve resources as accessible links. */
  render(): string {
    return HTML`
      <section id="shelf" class="support-resources" aria-labelledby="support-resources-title">
        <div class="support-resources-heading">
          <p class="support-eyebrow">Before you write</p>
          <h2 id="support-resources-title" class="support-section-title">Things that answer themselves.</h2>
          <p>Four places worth a look first. Between them they cover most of what lands in my inbox on a normal week.</p>
        </div>
        <div class="support-resource-list">
          ${supportContent.resources.map((resource) => `
            <a class="support-resource" href="${resource.href}"${resource.href.startsWith("http") ? " target=\"_blank\" rel=\"noreferrer\"" : ""}>
              <span class="support-resource-icon" aria-hidden="true">↗</span>
              <span><span class="support-resource-title">${resource.title}</span><span class="support-resource-copy">${resource.body}</span></span>
              <span class="support-resource-arrow" aria-hidden="true">→</span>
            </a>`).join("")}
        </div>
      </section>
    `;
  }
}
