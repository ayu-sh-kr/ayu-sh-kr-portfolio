import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

/**
 * Renders the portfolio's career journey as a sequence of chapter panels.
 *
 * Used on the home page. The motion controller reads the rendered chapter and
 * spine elements to synchronize scroll progress with the active chapter. This
 * component owns only the content and markup; it has no lifecycle side effects.
 *
 * Selector: `portfolio-journey`.
 */
@Component({
  selector: "portfolio-journey",
  shadow: false,
})
export class PortfolioJourneyComponent extends BaseElement {
  constructor() {
    super();
  }

  /**
   * Returns the chapter markup consumed by the home page and motion controller.
   * The content is read from `portfolioContent`, so rendering stays pure and
   * chapter changes do not require edits to the component structure.
   */
  render(): string {
    const { journey } = portfolioContent;

    return HTML`
      <div id="journey-wrap" class="pin-wrap journey-pin-wrap">
        <section class="pin-stage journey-stage" aria-labelledby="journey-title">
          <h2 id="journey-title" class="sr-only">Career journey</h2>
          <div id="journey-ghost" class="journey-ghost" aria-hidden="true">01</div>
          ${journey
            .map(
              (chapter, index) => `
                <article class="journey-chapter" data-chapter="${index}">
                  <p class="motion-eyebrow">${chapter.label}</p>
                  <h3 class="motion-title mx-auto mt-5 max-w-4xl">${chapter.title}</h3>
                  <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-(--muted-color)">${chapter.body}</p>
                  <p class="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-(--muted-strong-color)">${chapter.meta}</p>
                </article>
              `,
            )
            .join("")}
          <div class="journey-spine" aria-hidden="true">
            <div id="journey-spine-fill" class="journey-spine-fill"></div>
          </div>
          <div class="journey-count" aria-hidden="true"><span id="journey-current">01</span> / 04</div>
        </section>
      </div>
    `;
  }
}
