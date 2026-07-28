import { BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { isAnalyticsContactMethod } from "@app/events/analytics.events.ts";
import { portfolioContent } from "@app/data/portfolio-content.ts";
import { publishAnalyticsEvent } from "@app/utils/analytics.utils.ts";

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

  /** Publishes the selected contact destination without exposing its address or URL. */
  @BindEvent({event: "click", id: "[data-analytics-contact]"})
  trackContactClick(event: Event): void {
    const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("[data-analytics-contact]");
    const method = link?.dataset.analyticsContact;
    if (!link || !isAnalyticsContactMethod(method)) {
      return;
    }

    publishAnalyticsEvent({
      eventName: "contact_click",
      params: {method, surface: "home_contact"},
    });
  }

  /**
   * Returns the contact section using authored content and link destinations.
   * Rendering stays pure so copy or URL changes only require updating the data source.
   */
  render(): string {
    const { contact } = portfolioContent;

    return HTML`
      <section id="contact" class="layout-page layout-section-end border-b border-(--border-color) text-center" aria-labelledby="contact-title">
        <div class="layout-content">
          <p class="motion-eyebrow motion-reveal">${contact.eyebrow}</p>
          <h2 id="contact-title" class="motion-display motion-reveal mx-auto mt-5 max-w-5xl">
            ${contact.titleBeforeAccent} <span class="text-(--primary-color)">${contact.accent}</span>
          </h2>
          <p class="motion-reveal mx-auto mt-7 max-w-xl text-[length:var(--type-lede-size)] leading-[var(--type-lede-leading)] text-(--muted-color)">${contact.body}</p>
          <div class="motion-reveal mt-10 flex flex-wrap justify-center gap-3">
            <a class="motion-button motion-button-accent" data-analytics-contact="email" href="${contact.emailHref}">Email me</a>
            <a class="motion-button motion-button-ghost" data-analytics-contact="resume" href="${contact.resumeHref}">Request résumé</a>
          </div>
          <div class="motion-reveal mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-(--muted-color)">
            <a class="quiet-link" data-analytics-contact="github" href="${contact.github}" target="_blank" rel="noreferrer">GitHub</a>
            <a class="quiet-link" data-analytics-contact="linkedin" href="${contact.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
            <span>India · IST (UTC+5:30)</span>
          </div>
        </div>
      </section>
    `;
  }
}
