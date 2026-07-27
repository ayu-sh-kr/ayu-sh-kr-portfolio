import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

/**
 * Renders the selected-work rail on the portfolio home page.
 *
 * Each authored project becomes one card, including its chips and external-link
 * behavior. The motion controller later moves `#work-rail` through `#work-wrap`
 * as the page scrolls, while this component remains responsible for markup only.
 *
 * Selector: `portfolio-work`.
 */
@Component({
  selector: "portfolio-work",
  shadow: false,
})
export class PortfolioWorkComponent extends BaseElement {
  constructor() {
    super();
  }

  /**
   * Returns one card for each authored project, including its chips and link
   * attributes. The motion controller only changes the rail after this markup exists.
   */
  render(): string {
    const { work } = portfolioContent;

    return HTML`
      <div id="work-wrap" class="pin-wrap work-pin-wrap">
        <section id="work-stage" class="pin-stage work-stage" aria-labelledby="work-title">
          <div class="work-heading px-5 text-center sm:px-8">
            <p class="motion-eyebrow">Selected work</p>
            <h2 id="work-title" class="motion-title mt-4">Things I’ve shipped</h2>
          </div>
          <div id="work-rail" class="work-rail">
            ${work
              .map(
                (project) => `
                  <article class="work-card ${"cta" in project && project.cta ? "work-card-cta" : ""}">
                    <p class="motion-eyebrow">${project.eyebrow}</p>
                    <h3 class="mt-5 text-[1.85rem] font-semibold leading-tight tracking-tight">${project.title}</h3>
                    <p class="mt-4 text-[0.98rem] leading-7 text-[var(--muted-color)]">${project.body}</p>
                    <div class="mt-6 flex flex-wrap gap-2">
                      ${project.chips.map((chip) => `<span class="motion-chip">${chip}</span>`).join("")}
                    </div>
                    <a class="work-card-link" href="${project.link.href}" ${project.link.external ? 'target="_blank" rel="noreferrer"' : ""}>
                      ${project.link.label}<span aria-hidden="true"> →</span>
                    </a>
                  </article>
                `,
              )
              .join("")}
          </div>
          <p class="work-drag-hint" aria-hidden="true">Scroll to move through the work →</p>
        </section>
      </div>
    `;
  }
}
