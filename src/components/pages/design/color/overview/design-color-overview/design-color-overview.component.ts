import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

/** Ordered shade names for displaying the active primary scale. */
const PRIMARY_SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

/**
 * Introduces the color grammar and exposes the active primary scale.
 *
 * Swatches reference `--primary-*` aliases, never fixed values, making theme
 * changes immediately visible to the people maintaining this application.
 */
@Component({
  selector: "design-color-overview",
  shadow: false,
})
export class DesignColorOverviewComponent extends BaseElement {
  /** Creates the static color overview element. */
  constructor() {
    super();
  }

  /** Renders the token-source summary and active primary-scale specimen. */
  render(): string {
    return HTML`
      <section class="design-color-overview design-section" aria-labelledby="design-color-overview-title">
        <div class="design-color-overview-layout">
          <div class="design-color-overview-intro">
            <p class="type-eyebrow design-eyebrow">Design grammar / 02</p>
            <h1 id="design-color-overview-title" class="type-display design-color-overview-title">Color with a single source of truth.</h1>
            <p class="type-lede design-color-overview-lede">Literal palette values live in <code>theme.css</code>. <code>color.css</code> maps the active family to semantic roles, so public components never need to name a hue or a scale step.</p>
            <div class="design-overview-links">
              <a class="design-overview-link" href="#design-color-roles">Browse the color roles <span aria-hidden="true">↓</span></a>
              <a class="design-overview-link" href="/design">Explore typography grammar <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <aside class="design-overview-summary" aria-label="Color system summary">
            <p class="type-label design-summary-label">Shared system</p>
            <dl class="design-summary-list">
              <div><dt>Palette source</dt><dd><code>src/theme.css</code></dd></div>
              <div><dt>Active family</dt><dd>True Matcha</dd></div>
              <div><dt>Role source</dt><dd><code>src/color.css</code></dd></div>
              <div><dt>Consumers</dt><dd>Semantic variables only</dd></div>
            </dl>
          </aside>
        </div>

        <div class="design-primary-scale" aria-label="Active primary color scale">
          ${PRIMARY_SHADES.map((shade) => HTML`
            <div class="design-primary-swatch">
              <span class="design-primary-swatch-color" style="--design-swatch: var(--primary-${shade});"></span>
              <span class="type-label design-primary-swatch-label">${shade}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }
}
