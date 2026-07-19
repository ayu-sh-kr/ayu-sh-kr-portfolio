import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "portfolio-journey",
  shadow: false,
})
export class PortfolioJourneyComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return HTML`
      <div id="journey-wrap" class="pin-wrap journey-pin-wrap">
        <section class="pin-stage journey-stage" aria-labelledby="journey-title">
          <h2 id="journey-title" class="sr-only">Career journey</h2>
          <div id="journey-ghost" class="journey-ghost" aria-hidden="true">01</div>
          ${portfolioContent.journey
            .map(
              (chapter, index) => `
                <article class="journey-chapter" data-chapter="${index}">
                  <p class="motion-eyebrow">${chapter.label}</p>
                  <h3 class="motion-title mx-auto mt-5 max-w-4xl">${chapter.title}</h3>
                  <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-inkstone-500 dark:text-inkstone-300">${chapter.body}</p>
                  <p class="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-inkstone-400 dark:text-inkstone-400">${chapter.meta}</p>
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
