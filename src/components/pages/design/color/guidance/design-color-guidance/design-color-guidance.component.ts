import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designColorContent } from "@app/data/design-color-content.ts";

/** Preserves the visual ground and control treatment for each color-pair specimen. */
const PAIR_LAYOUTS = [
  { className: "design-color-pair-canvas", usesControl: false },
  { className: "design-color-pair-surface", usesControl: false },
  { className: "design-color-pair-action", usesControl: true },
  { className: "design-color-pair-subtle", usesControl: false },
  { className: "design-color-pair-contrast", usesControl: false },
] as const;

/**
 * Documents the decisions that keep color use coherent across the application.
 *
 * The `/design/color` route supplies the copy and token pairings through
 * `designColorContent`, while this element keeps their visual specimens and
 * semantic structure consistent with production UI.
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
    const { guidance } = designColorContent;

    return HTML`
      <section class="design-color-guidance design-section" aria-labelledby="design-color-guidance-title">
        <div class="design-color-guidance-layout">
          <div>
            <p class="type-eyebrow design-eyebrow">${guidance.eyebrow}</p>
            <h2 id="design-color-guidance-title" class="type-section-heading design-section-heading">${guidance.title}</h2>
            <p class="type-body design-color-guidance-copy">${guidance.lede}</p>
          </div>

          <div class="design-color-pair-grid" aria-label="${guidance.pairAriaLabel}">
            ${guidance.pairs.map((pair, index) => {
              const layout = PAIR_LAYOUTS[index];

              return HTML`
                <article class="design-color-pair ${layout.className}">
                  <p class="type-label">${pair.label}</p>
                  ${layout.usesControl
                    ? HTML`<button class="type-control" type="button">${pair.heading}</button>`
                    : HTML`<strong class="type-card-title">${pair.heading}</strong>`}
                  <span class="type-compact">${pair.token}</span>
                </article>
              `;
            }).join("")}
          </div>
        </div>

        <div class="design-color-rule-grid">
          ${guidance.rules.map((rule) => HTML`
            <article>
              <h3 class="type-card-title">${rule.title}</h3>
              <p class="type-compact">${rule.body}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }
}
