import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { coffeeContent } from "@app/data/coffee-content.ts";
import { type CoffeeSummary, coffeeOrderService } from "@app/service/coffee-order/coffee-order.service.ts";
import { CoffeeRevealLifecycle } from "@app/utils/coffee-reveal-lifecycle.utils.ts";

/** Lifecycle state used to distinguish loading, unavailable, and empty support activity. */
type SupportersState = "loading" | "ready" | "unavailable";

/**
 * Displays the recent-supporter wall and its running total from live backend data.
 *
 * The initial render stays static for SSR; once connected in the browser the
 * component loads the buy-coffee summary and re-renders with real contributions,
 * an intentional empty state, or a temporary-unavailable message. Row grammar
 * and the reveal lifecycle are unchanged from the authored version.
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

  /** Live summary once loaded; null represents loading or an unavailable response. */
  private summary: CoffeeSummary | null = null;

  /** Current request state used to choose the reader-facing fallback. */
  private state: SupportersState = "loading";

  /** Creates the supporter-wall element. */
  constructor() {
    super();
  }

  /**
   * Connects the reveal observer and starts the browser-only summary request.
   * SSR keeps the authored copy so the route has useful initial HTML before the
   * backend can be contacted.
   */
  @OnEvent("connected", true)
  initialize(): void {
    this.revealLifecycle.connect();
    if (!import.meta.env.SSR && !this.summary) {
      void this.loadSummary();
    }
  }

  /** Releases the observer that reveals the heading and supporter rows. */
  @OnEvent("disconnected", true)
  cleanupReveals(): void {
    this.revealLifecycle.disconnect();
  }

  /**
   * Loads public contribution history and renders the result state.
   *
   * A valid response with no latest entries becomes the intentional empty state;
   * a rejected request becomes an unavailable state instead of leaving a blank
   * list that could be mistaken for missing content.
   */
  private async loadSummary(): Promise<void> {
    try {
      this.summary = await this.orderService.getSummary();
      this.state = "ready";
      this.updateHTML();
      this.revealLifecycle.refresh();
    } catch {
      this.state = "unavailable";
      this.updateHTML();
      this.revealLifecycle.refresh();
    }
  }

  /** Formats one backend contribution into the row fields rendered by this section. */
  private toEntry(contribution: CoffeeSummary["latest"][number]): { name: string; note?: string; amount: string; when: string } {
    return {
      name: contribution.name,
      note: contribution.shortNote ?? undefined,
      amount: new Intl.NumberFormat("en-IN", { style: "currency", currency: contribution.currency, maximumFractionDigits: 0 }).format(contribution.amount / 100),
      when: "recently",
    };
  }

  /**
   * Renders the live rows or the authored empty/unavailable state while keeping
   * all network work in {@link loadSummary}.
   */
  render(): string {
    const content = coffeeContent.supporters;
    const summary = this.summary;
    const entries = summary?.latest.map((contribution) => this.toEntry(contribution)) ?? content.entries.map((entry) => ({ ...entry }));
    const hasEntries = entries.length > 0;
    const isUnavailable = this.state === "unavailable";
    const statusSummary = isUnavailable ? content.unavailableSummary : hasEntries ? `${summary!.total} ${summary!.total === 1 ? "contribution" : "contributions"} so far.` : content.emptySummary;
    const fallback = isUnavailable
      ? `<h3>${content.unavailableTitle}</h3><p>${content.unavailableBody}</p>`
      : `<h3>${content.emptyTitle}</h3><p>${content.emptyBody}</p>`;

    return HTML`
      <section id="coffee-supporters" class="coffee-supporters-section layout-content layout-section-lg layout-stack layout-stack-xl" aria-labelledby="coffee-supporters-title">
        <header class="layout-stack layout-stack-sm" data-coffee-reveal>
          <p class="coffee-supporters-summary">${this.state === "loading" ? content.summary : statusSummary}</p>
          <h2 id="coffee-supporters-title" class="type-subsection">${content.title}</h2>
        </header>
        <div class="coffee-supporter-list" aria-live="polite">
          ${entries.map((entry) => `<article class="coffee-supporter-row" data-coffee-reveal><span class="coffee-supporter-initial" aria-hidden="true">${entry.name.slice(0, 1)}</span><div><h3>${entry.name}</h3>${entry.note ? `<p>${entry.note}</p>` : ""}</div><span class="coffee-supporter-amount">${entry.amount}</span><time>${entry.when}</time></article>`).join("")}
          ${this.state !== "loading" && !hasEntries ? `<div class="coffee-supporters-empty layout-stack layout-stack-sm" role="status">${fallback}</div>` : ""}
        </div>
      </section>
    `;
  }
}
