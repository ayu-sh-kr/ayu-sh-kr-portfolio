import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "portfolio-services",
  shadow: false,
})
export class PortfolioServicesComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return HTML`
      <section id="services" class="border-y border-[var(--border-color)] px-5 py-28 sm:px-8 sm:py-36" aria-labelledby="services-title">
        <div class="mx-auto max-w-7xl">
          <div class="grid gap-8 lg:grid-cols-12">
            <p class="motion-eyebrow motion-reveal lg:col-span-3">How I can help</p>
            <h2 id="services-title" class="motion-title motion-reveal lg:col-span-9">Bring me the outcome, not a shopping list of frameworks.</h2>
          </div>
          <div class="mt-16 grid border-l border-t border-[var(--border-color)] md:grid-cols-3">
            ${portfolioContent.services
              .map(
                (service) => `
                  <article class="service-row motion-reveal">
                    <span class="font-mono text-xs text-[var(--muted-strong-color)]">${service.number}</span>
                    <h3 class="mt-16 text-2xl font-semibold leading-tight tracking-[-0.02em]">${service.title}</h3>
                    <p class="mt-5 text-[0.98rem] leading-7 text-[var(--muted-color)]">${service.body}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }
}
