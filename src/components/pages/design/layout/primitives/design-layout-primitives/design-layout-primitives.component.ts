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
      <section class="design-layout-primitives layout-page layout-section" aria-labelledby="design-layout-primitives-title">
        <div class="design-layout-primitives-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${primitives.eyebrow}</p>
          <h2 id="design-layout-primitives-title" class="type-section">${primitives.title}</h2>
          <p class="type-lede">${primitives.lede}</p>
        </div>

        <div class="design-layout-primitives-grid layout-grid-2">
          <section class="design-layout-primitive-card layout-stack layout-stack-lg" aria-label="Space scale">
            <div class="layout-stack layout-stack-xs">
              <p class="type-label">Shared spacing</p>
              <h3 class="type-subsection">One scale for every gap.</h3>
            </div>
            <dl class="design-layout-space-scale">
              ${primitives.space.map(([token, value]) => HTML`<div><dt><code>${token}</code></dt><dd>${value}</dd></div>`).join("")}
            </dl>
          </section>

          <section class="design-layout-primitive-card layout-stack layout-stack-lg" aria-label="Section rhythm">
            <div class="layout-stack layout-stack-xs">
              <p class="type-label">Section rhythm</p>
              <h3 class="type-subsection">Sections own the breathing room.</h3>
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
            <div class="design-layout-grid-cells layout-grid-auto-sm" aria-label="Content-driven grid specimen">
              <span></span><span></span><span></span>
            </div>
          </section>
          <aside class="design-layout-chrome-specimen layout-rail layout-stack layout-stack-sm" aria-label="Chrome token reference">
            <p class="type-label">Fixed and sticky chrome</p>
            <dl>
              ${primitives.chrome.map((item) => HTML`<div><dt><code>${item.token}</code></dt><dd>${item.use}</dd></div>`).join("")}
            </dl>
          </aside>
        </div>
      </section>
    `;
  }
}
