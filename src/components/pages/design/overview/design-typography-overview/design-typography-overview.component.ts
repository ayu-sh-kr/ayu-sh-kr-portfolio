import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Introduces the typography design grammar and its hierarchy.
 *
 * Used only by the `/design` route. The specimens deliberately inherit the
 * app's active font and semantic colors, making the section a quick visual
 * check of the tokens that public pages consume.
 */
@Component({
  selector: "design-typography-overview",
  shadow: false,
})
export class DesignTypographyOverviewComponent extends BaseElement {
  /** Creates the static overview element. */
  constructor() {
    super();
  }

  /** Renders the route introduction, shared-token summary, and role flow. */
  render(): string {
    return HTML`
      <section class="design-overview design-section" aria-labelledby="design-overview-title">
        <div class="design-overview-layout">
          <div class="design-overview-intro">
            <p class="type-eyebrow design-eyebrow">Design grammar / 01</p>
            <h1 id="design-overview-title" class="type-display design-overview-title">Typography that holds every page together.</h1>
            <p class="type-lede design-overview-lede">A live reference for choosing type roles. These specimens render from <code>typography.css</code>, so a token change here is the same change visitors see across the portfolio.</p>
            <a class="design-overview-link" href="#design-roles">Browse the role specimens <span aria-hidden="true">↓</span></a>
          </div>

          <aside class="design-overview-summary" aria-label="Typography system summary">
            <p class="type-label design-summary-label">Shared system</p>
            <dl class="design-summary-list">
              <div>
                <dt>Source</dt>
                <dd><code>src/typography.css</code></dd>
              </div>
              <div>
                <dt>Family</dt>
                <dd><code>--primary-font</code></dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>Display to metric</dd>
              </div>
              <div>
                <dt>Color</dt>
                <dd>Semantic tokens only</dd>
              </div>
            </dl>
          </aside>
        </div>

        <div class="design-role-flow" aria-label="Typography hierarchy">
          <span class="design-flow-item">Display</span>
          <span aria-hidden="true">→</span>
          <span class="design-flow-item">Section</span>
          <span aria-hidden="true">→</span>
          <span class="design-flow-item">Lede</span>
          <span aria-hidden="true">→</span>
          <span class="design-flow-item">Body</span>
          <span aria-hidden="true">→</span>
          <span class="design-flow-item">Support</span>
        </div>
      </section>
    `;
  }
}
