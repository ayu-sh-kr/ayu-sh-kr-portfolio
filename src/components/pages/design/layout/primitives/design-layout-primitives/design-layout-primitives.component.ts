import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designLayoutContent } from "@app/data/design-layout-content.ts";

/** Renders live specimens for the shared layout spacing, grid, and chrome primitives. */
@Component({
  selector: "design-layout-primitives",
  shadow: false,
})
export class DesignLayoutPrimitivesComponent extends BaseElement {
  /** Creates the static layout-primitives element. */
  constructor() {
    super();
  }

  /** Renders the layout primitives that route components consume directly. */
  render(): string {
    const { primitives } = designLayoutContent;

    return HTML`
      <section id="design-layout-primitives" class="design-layout-primitives layout-page layout-section" aria-labelledby="design-layout-primitives-title">
        <div class="design-layout-primitives-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${primitives.eyebrow}</p>
          <h2 id="design-layout-primitives-title" class="type-section">${primitives.title}</h2>
          <p class="type-lede">${primitives.lede}</p>
        </div>

        <div class="design-layout-primitives-grid layout-grid-2">
          <section class="design-layout-primitive-card layout-stack layout-stack-lg" aria-label="${primitives.specimens.space.ariaLabel}">
            <div class="layout-stack layout-stack-xs">
              <p class="type-label">${primitives.specimens.space.label}</p>
              <h3 class="type-subsection">${primitives.specimens.space.title}</h3>
            </div>
            <dl class="design-layout-space-scale">
              ${primitives.space.map(([token, value]) => HTML`<div><dt><code>${token}</code></dt><dd>${value}</dd></div>`).join("")}
            </dl>
          </section>

          <section class="design-layout-primitive-card layout-stack layout-stack-lg" aria-label="${primitives.specimens.rhythm.ariaLabel}">
            <div class="layout-stack layout-stack-xs">
              <p class="type-label">${primitives.specimens.rhythm.label}</p>
              <h3 class="type-subsection">${primitives.specimens.rhythm.title}</h3>
            </div>
            <dl class="design-layout-rhythm-list">
              ${primitives.rhythm.map((item) => HTML`<div><dt><code>${item.token}</code></dt><dd>${item.use}</dd></div>`).join("")}
            </dl>
          </section>
        </div>

        <div class="design-layout-primitive-showcase layout-grid-rail">
          <section class="design-layout-grid-specimen layout-stack layout-stack-sm">
            <p class="type-label">${primitives.grid.label}</p>
            <h3 class="type-subsection">${primitives.grid.title}</h3>
            <p>${primitives.grid.body}</p>
            <div class="design-layout-grid-cells layout-grid-auto-sm" aria-label="${primitives.specimens.gridAriaLabel}">
              <span></span><span></span><span></span>
            </div>
          </section>
          <aside class="design-layout-chrome-specimen layout-rail layout-stack layout-stack-sm" aria-label="${primitives.specimens.chromeAriaLabel}">
            <p class="type-label">${primitives.specimens.chromeLabel}</p>
            <dl>
              ${primitives.chrome.map((item) => HTML`<div><dt><code>${item.token}</code></dt><dd>${item.use}</dd></div>`).join("")}
            </dl>
          </aside>
        </div>
      </section>
    `;
  }
}
