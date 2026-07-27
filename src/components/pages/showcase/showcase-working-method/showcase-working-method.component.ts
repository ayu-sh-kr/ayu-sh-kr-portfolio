import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { showcaseSupport } from "@app/data/showcase-content.ts";

@Component({
  selector: "showcase-working-method",
  shadow: false,
})
export class ShowcaseWorkingMethodComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return HTML`
      <div class="showcase-support-work-grid">
        ${showcaseSupport.waysOfWorking
          .map(
            (way) => `
              <article class="showcase-support-way showcase-reveal" data-showcase-reveal>
                <span class="showcase-support-number">${way.number}</span>
                <h2 class="mt-6">${way.title}</h2>
                <p class="mt-4">${way.body}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    `;
  }
}

