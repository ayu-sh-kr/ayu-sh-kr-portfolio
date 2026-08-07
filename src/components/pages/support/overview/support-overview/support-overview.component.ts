import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Introduces the support route with current desk expectations and the message flow.
 *
 * This is the first support-specific section after the shared header. It updates the
 * desk note after connection and once per minute, while the availability card remains
 * an intentionally static operational-status statement.
 *
 * Selector: `support-overview`.
 */
@Component({
  selector: "support-overview",
  shadow: false,
})
export class SupportOverviewComponent extends BaseElement {
  /** Timer that keeps the office-hours note accurate until this element disconnects. */
  private deskClock: number | null = null;

  /** Initializes the dynamic IST desk note after the overview markup is available. */
  @OnEvent("connected", true)
  initializeDeskClock(): void {
    this.renderDeskAvailability();
    if (import.meta.env.SSR) {
      return;
    }

    this.deskClock = window.setInterval(() => this.renderDeskAvailability(), 60_000);
  }

  /** Clears the clock so a disconnected route cannot retain a window timer. */
  @OnEvent("disconnected", true)
  cleanupDeskClock(): void {
    if (this.deskClock !== null) {
      window.clearInterval(this.deskClock);
      this.deskClock = null;
    }
  }

  /**
   * Writes the present desk state using weekday office hours in IST.
   *
   * The status dot is deliberately not derived from these hours: being away from the
   * desk does not mean the hosted systems are unavailable.
   */
  private renderDeskAvailability(): void {
    const note = this.querySelector<HTMLElement>("#support-desk-now");
    if (!note) {
      return;
    }

    const now = new Date();
    const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60_000);
    const day = ist.getDay();
    const hour = ist.getHours() + ist.getMinutes() / 60;
    const isAtDesk = day >= 1 && day <= 5 && hour >= 10 && hour < 19;
    const localTime = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    note.textContent = isAtDesk
      ? `At the desk now · your time ${localTime}`
      : "Away right now · messages still land, replies come next working morning";
  }

  /** Renders the route's operational introduction from the authored support content. */
  render() {
    const { overview } = supportContent;

    return html`
      <section class="support-overview layout-page layout-section-hero" aria-labelledby="support-overview-title">
        <p class="support-eyebrow">${overview.eyebrow}</p>
        <h1 id="support-overview-title" class="support-display type-display">
          ${overview.titleBeforeAccent} <span>${overview.titleAccent}</span> ${overview.titleAfterAccent}
        </h1>
        <p class="support-overview-lede">${overview.lede}</p>

        <div class="support-desk" aria-label="Support desk status">
          <div class="support-desk-cell">
            <p class="support-desk-key">Systems</p>
            <p class="support-desk-value"><span class="support-status-dot" aria-hidden="true"></span>All operational</p>
            <p class="support-desk-sub">Current hosted-service status</p>
          </div>
          <div class="support-desk-cell">
            <p class="support-desk-key">Replying in</p>
            <p class="support-desk-value">~4 hours</p>
            <p class="support-desk-sub">Median first reply over 30 days</p>
          </div>
          <div class="support-desk-cell">
            <p class="support-desk-key">At the desk</p>
            <p class="support-desk-value">${overview.deskHours}</p>
            <p class="support-desk-sub" id="support-desk-now" aria-live="polite"></p>
          </div>
        </div>

        <p class="support-urgent">
          ${overview.urgentPrefix}
          <a href="${overview.urgentHref}">${overview.urgentLabel}</a>
          with <b>URGENT</b> in the subject.
        </p>
      </section>
    `;
  }
}
