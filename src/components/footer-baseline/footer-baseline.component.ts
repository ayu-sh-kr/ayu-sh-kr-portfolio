import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "footer-baseline",
  shadow: false,
})
export class FooterBaselineComponent extends BaseElement {
  private clockTimer: number | null = null;
  private clock: HTMLElement | null = null;

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.clock = this.querySelector<HTMLElement>(".footer-clock");
    this.updateClock();
    this.clockTimer = window.setInterval(() => this.updateClock(), 1000);
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    if (this.clockTimer !== null) {
      window.clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
    this.clock = null;
  }

  private updateClock(): void {
    const { clockLocale, clockTimeZone, clockSuffix } = portfolioContent.footer.baseline;
    if (this.clock) {
      this.clock.textContent = `${new Date().toLocaleTimeString(clockLocale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: clockTimeZone,
      })}${clockSuffix}`;
    }
  }

  render(): string {
    const { availability, copyright, role } = portfolioContent.footer.baseline;

    return HTML`
      <div class="footer-baseline-section">
        <div class="footer-content footer-baseline-content">
          <p class="footer-baseline-copy">© ${new Date().getFullYear()} ${copyright} · ${role} · ${availability}</p>
          <p class="footer-clock" aria-label="Current time in India"></p>
        </div>
      </div>
    `;
  }
}
