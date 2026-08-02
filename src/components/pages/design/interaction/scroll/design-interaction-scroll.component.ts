import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Collects the scroll-response rules so page-level reading state remains one coordinated concern. */
@Component({ selector: "design-interaction-scroll", shadow: false })
export class DesignInteractionScrollComponent extends BaseElement {
  /** Creates the static scroll-reference section. */
  constructor() {
    super();
  }

  /** Renders the reveal, rail, and abbreviated pin specimens. */
  render(): string {
    const { scroll } = designInteractionContent;
    const [reveal, progress, pin] = scroll.specimens;

    return HTML`
      <section id="scroll" class="design-interaction-section layout-page layout-section" aria-labelledby="scroll-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${scroll.eyebrow}</p>
          <h2 id="scroll-title" class="type-section">${scroll.title}</h2>
          <p class="type-lede">${scroll.lede}</p>
        </header>
        <div class="design-interaction-spec-grid layout-grid-auto-sm">
          <article>
            <p class="type-label">${reveal.label}</p>
            <div class="design-interaction-reveal">${reveal.stage}</div>
            <p>${reveal.body}</p>
          </article>
          <article>
            <p class="type-label">${progress.label}</p>
            <div class="design-interaction-rail">
              <i>
              </i>
            </div>
            <p>${progress.body}</p>
          </article>
          <article>
            <p class="type-label">${pin.label}</p>
            <div class="design-interaction-pin">
              <span>${pin.stage}</span>
            </div>
            <p>${pin.body}</p>
          </article>
        </div>
      </section>`;
  }
}
