import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "portfolio-skills",
  shadow: false,
})
export class PortfolioSkillsComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return HTML`
      <section id="skills" class="layout-page layout-section" aria-labelledby="skills-title">
        <p class="motion-eyebrow motion-reveal">Capabilities</p>
        <h2 id="skills-title" class="motion-title motion-reveal mt-4 max-w-4xl">
          Backend-first.<br /><span class="text-(--muted-strong-color)">Full product when it’s needed.</span>
        </h2>
        <div class="skills-grid layout-grid-auto-sm">
          ${portfolioContent.skills
            .map(
              (group) => `
                <article class="skill-group motion-reveal">
                  <h3 class="motion-eyebrow">${group.name}</h3>
                  <div class="mt-5 flex flex-wrap gap-2">
                    ${group.items.map((item) => `<span class="motion-chip">${item}</span>`).join("")}
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }
}
