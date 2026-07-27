import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

/**
 * Renders the contact call-to-action section on the portfolio home page.
 *
 * The section reads its copy and destinations from `portfolioContent.contact`.
 * Its email, résumé, and external profile links are rendered as static markup;
 * the motion controller applies reveal effects after this component connects.
 *
 * Selector: `portfolio-contact`.
 */
@Component({
  selector: "portfolio-contact",
  shadow: false,
})
export class PortfolioContactComponent extends BaseElement {
  constructor() {
    super();
  }

  /**
   * Returns the contact section using authored content and link destinations.
   * Rendering stays pure so copy or URL changes only require updating the data source.
   */
  render(): string {
    const { contact } = portfolioContent;

    return HTML`
      <section id="contact" class="border-b border-(--border-color) px-5 py-32 text-center sm:px-8 sm:py-40" aria-labelledby="contact-title">
        <div class="mx-auto max-w-6xl">
          <p class="motion-eyebrow motion-reveal">${contact.eyebrow}</p>
          <h2 id="contact-title" class="motion-display motion-reveal mx-auto mt-5 max-w-5xl text-[clamp(2.8rem,7vw,6.5rem)]">
            ${contact.titleBeforeAccent} <span class="text-(--primary-color)">${contact.accent}</span>
          </h2>
          <p class="motion-reveal mx-auto mt-7 max-w-xl text-lg leading-8 text-(--muted-color)">${contact.body}</p>
          <div class="motion-reveal mt-10 flex flex-wrap justify-center gap-3">
            <a class="motion-button motion-button-accent" href="${contact.emailHref}">Email me</a>
            <a class="motion-button motion-button-ghost" href="${contact.resumeHref}">Request résumé</a>
          </div>
          <div class="motion-reveal mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-(--muted-color)">
            <a class="quiet-link" href="${contact.github}" target="_blank" rel="noreferrer">GitHub</a>
            <a class="quiet-link" href="${contact.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
            <span>India · IST (UTC+5:30)</span>
          </div>
        </div>
      </section>
    `;
  }
}
