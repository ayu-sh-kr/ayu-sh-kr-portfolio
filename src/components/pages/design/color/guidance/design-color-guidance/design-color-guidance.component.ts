import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Documents the decisions that keep color use coherent across the application.
 *
 * The specimens intentionally use the same semantic pairs as production UI so
 * maintainers can inspect their behavior in the active light or dark theme.
 */
@Component({
  selector: "design-color-guidance",
  shadow: false,
})
export class DesignColorGuidanceComponent extends BaseElement {
  /** Creates the static color-guidance element. */
  constructor() {
    super();
  }

  /** Renders contrast specimens and concise implementation guidance. */
  render(): string {
    return HTML`
      <section class="design-color-guidance design-section" aria-labelledby="design-color-guidance-title">
        <div class="design-color-guidance-layout">
          <div>
            <p class="type-eyebrow design-eyebrow">Application rules</p>
            <h2 id="design-color-guidance-title" class="type-section-heading design-section-heading">Make the theme do the work.</h2>
            <p class="type-body design-color-guidance-copy">These pairs are the only color relationships a component needs to express. Theme aliases select their values; component CSS stays focused on intent.</p>
          </div>

          <div class="design-color-pair-grid" aria-label="Core color-pair specimens">
            <article class="design-color-pair design-color-pair-canvas">
              <p class="type-label">Canvas / content</p>
              <strong class="type-card-title">Readable default</strong>
              <span class="type-compact">--background-color + --foreground-color</span>
            </article>
            <article class="design-color-pair design-color-pair-surface">
              <p class="type-label">Surface / content</p>
              <strong class="type-card-title">Human input</strong>
              <span class="type-compact">--surface-color + --foreground-color</span>
            </article>
            <article class="design-color-pair design-color-pair-action">
              <p class="type-label">Action / on action</p>
              <button class="type-control" type="button">Primary action</button>
              <span class="type-compact">--primary-color + --primary-color-on</span>
            </article>
            <article class="design-color-pair design-color-pair-subtle">
              <p class="type-label">Subtle / content</p>
              <strong class="type-card-title">Aside or mark</strong>
              <span class="type-compact">--primary-color-subtle + --foreground-color</span>
            </article>
            <article class="design-color-pair design-color-pair-contrast">
              <p class="type-label">Contrast / content</p>
              <strong class="type-card-title">Focused emphasis</strong>
              <span class="type-compact">--contrast-background-color + --contrast-foreground-color</span>
            </article>
          </div>
        </div>

        <div class="design-color-rule-grid">
          <article>
            <h3 class="type-card-title">Use semantic names</h3>
            <p class="type-compact">Choose <code>--muted-color</code> for supporting copy, not a shade that only works on one surface.</p>
          </article>
          <article>
            <h3 class="type-card-title">Keep literals in the palette</h3>
            <p class="type-compact">Add or adjust raw color values only in <code>src/theme.css</code>; map their meaning in <code>src/color.css</code>.</p>
          </article>
          <article>
            <h3 class="type-card-title">Theme state is centralized</h3>
            <p class="type-compact">Light and dark values resolve through the same aliases. Do not add page-level theme overrides.</p>
          </article>
          <article>
            <h3 class="type-card-title">Use the mix ramp</h3>
            <p class="type-compact">Choose <code>--primary-color-ring</code> or <code>--shadow-lift</code> instead of creating a new alpha or shadow in a component.</p>
          </article>
        </div>
      </section>
    `;
  }
}
