import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { type CoffeeSummary, coffeeOrderService } from "@app/service/coffee-order/coffee-order.service.ts";
import { CoffeeRevealLifecycle } from "@app/utils/coffee-reveal-lifecycle.utils.ts";

/**
 * Displays the recent-supporter wall and its running total from live backend data.
 *
 * The initial render stays static for SSR; once connected in the browser the
 * component loads the buy-coffee summary and re-renders with real contributions.
 * Row grammar and the reveal lifecycle are unchanged from the authored version.
 *
 * Selector: `coffee-supporters`.
 */
@Component({
  selector: "coffee-supporters",
  shadow: false,
})
export class CoffeeSupportersComponent extends BaseElement {
  /** Observer lifecycle used for the supporter heading and individual rows. */
  private readonly revealLifecycle = new CoffeeRevealLifecycle(this);

  /** Transport boundary shared with the buy-coffee backend. */
  private readonly orderService = coffeeOrderService;

  /** Live summary once loaded; null keeps the authored placeholder state. */
  private summary: CoffeeSummary | null = null;

  /** Creates the supporter-wall element. */
  constructor() {
    super();
  }

  /** Reveals the wall on viewport entry and, in the browser, starts the summary load. */
  @OnEvent("connected", true)
  initialize(): void {
    this.revealLifecycle.connect();
    if (!import.meta.env.SSR && !this.summary) {
      void this.loadSummary();
    }
  }

  /** Releases observer resources when the page route disconnects. */
  @OnEvent("disconnected", true)
  cleanupReveals(): void {
    this.revealLifecycle.disconnect();
  }

  /** Loads the public contribution history and re-renders the wall with it. */
  private async loadSummary(): Promise<void> {
    try {
      this.summary = await this.orderService.getSummary();
      this.updateHTML();
      this.revealLifecycle.refresh();
    } catch {
      // The authored placeholder content remains visible when the backend is unavailable.
    }
  }

  /** Formats a summary entry into a row's public display fields. */
  private toEntry(contribution: CoffeeSummary["latest"][number]): { name: string; note?: string; amount: string; when: string } {
    return {
      name: contribution.name,
      note: contribution.shortNote ?? undefined,
      amount: new Intl.NumberFormat("en-IN", { style: "currency", currency: contribution.currency, maximumFractionDigits: 0 }).format(contribution.amount / 100),
      when: "recently",
    };
  }

  /** Returns the total and the hairline-separated recent support entries. */
  render(): string {
    const content = coffeeContent.supporters;
    const summary = this.summary;
    const entries = summary
      ? summary.latest.map((contribution) => this.toEntry(contribution))
      : content.entries.map((entry) => ({ ...entry }));

    return HTML`
      <section id="coffee-supporters" class="coffee-supporters-section layout-content layout-section-lg layout-stack layout-stack-xl" aria-labelledby="coffee-supporters-title">
        <header data-coffee-reveal>
          <p class="coffee-supporters-summary">${summary ? `${summary.total} ${summary.total === 1 ? "contribution" : "contributions"} so far.` : content.summary}</p>
          <h2 id="coffee-supporters-title" class="type-subsection mt-3">${content.title}</h2>
        </header>
        <div class="coffee-supporter-list">
          ${entries.map((entry) => `<article class="coffee-supporter-row" data-coffee-reveal><span class="coffee-supporter-initial" aria-hidden="true">${entry.name.slice(0, 1)}</span><div><h3>${entry.name}</h3>${entry.note ? `<p>${entry.note}</p>` : ""}</div><span class="coffee-supporter-amount">${entry.amount}</span><time>${entry.when}</time></article>`).join("")}
        </div>
      </section>
    `;
  }
}