import { BaseElement, BindEvent, Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { html, when } from "@ayu-sh-kr/dota-wrap/rendering";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { letterUnsubscribeContent as content } from "@app/data/letter-content.ts";
import { RouterUtils } from "@app/utils/router.utils.ts";
import { markSubscriptionNoIndex, readSubscriptionToken } from "@app/utils/subscription-route.utils.ts";
import { SubscriptionService } from "@app/service/subscription.service.ts";

type FlowView = "confirm" | "done";
type ConfirmState = "ready" | "invalid" | "loading";
type ActionState = "idle" | "pending" | "success" | "error";

const DEFAULT_DELAY = 650;

/**
 * Selects the status affordance shown beside an action label.
 *
 * Pending uses the shared spinner treatment, terminal states use text glyphs,
 * and idle intentionally contributes no extra markup to the button.
 */
const actionGlyph = (state: ActionState) => {
  if (state === "pending") return html`<span class="unsubscribe-spinner" aria-hidden="true"></span>`;
  if (state === "success") return html`<span class="unsubscribe-glyph" aria-hidden="true">✓</span>`;
  if (state === "error") return html`<span class="unsubscribe-glyph" aria-hidden="true">×</span>`;
  return "";
};

/**
 * Renders both newsletter-management routes and owns their local action states.
 *
 * The confirm route accepts a token or email query value, while the done route
 * shows the receipt and subscribe-again affordance. Actions use a short local delay to
 * expose pending, success, and recoverable failure states before navigation or
 * confirmation content changes.
 *
 * Selector: `unsubscribe-flow`.
 */
@Component({ selector: "unsubscribe-flow", shadow: false })
export class UnsubscribeFlowComponent extends BaseElement {
  /**
   * Selects the flow view rendered by the route shell.
   *
   * Attribute `view` accepts `confirm` or `done`; it defaults to `confirm` and
   * changes which authored content and action controls `render()` composes.
   */
  @Property({ name: "view", type: String })
  view: FlowView = "confirm";

  private confirmState: ConfirmState = "loading";
  private actionState: ActionState = "idle";
  private address: string = content.common.defaultEmail;
  private errorMessage = "";
  private reissueEmail = "";
  private reissueSent = false;
  private forceFailure = false;
  private pendingTimer: number | null = null;
  private token = "";
  private readonly subscriptionService = new SubscriptionService();

  constructor() {
    super();
  }

  /**
   * Initializes the flow from the current unsubscribe link.
   *
   * The email and token query values determine whether confirmation is ready or
   * invalid; the route is marked no-index before the first state render so a
   * private management link is never treated as public content.
   */
  @OnEvent("connected", true)
  initialize(): void {
    const params = new URLSearchParams(window.location.search);
    this.token = readSubscriptionToken(params);
    this.address = params.get("e") || content.common.defaultEmail;
    this.confirmState = this.token || params.get("e") ? "ready" : "invalid";
    this.forceFailure = params.get("mock") === "fail";
    markSubscriptionNoIndex();
    this.updateHTML();
  }

  /**
   * Cancels delayed action completion when the flow disconnects.
   *
   * This prevents a stale unsubscribe or reissue callback from changing
   * state after navigation has removed the component.
   */
  @OnEvent("disconnected", true)
  cleanup(): void {
    if (this.pendingTimer !== null) window.clearTimeout(this.pendingTimer);
  }

  /**
   * Runs the confirmation action and navigates to the receipt on success.
   *
   * The current address is encoded into the receipt URL so the next route can
   * show the same subscriber context without sharing component state.
   */
  @BindEvent({ event: "click", id: "#unsubscribe-action" })
  async unsubscribe(): Promise<void> {
    if (!this.token || this.actionState === "pending") return;
    this.actionState = "pending";
    this.errorMessage = "";
    this.updateHTML();
    try {
      await this.subscriptionService.unsubscribe(this.token);
      this.actionState = "success";
      RouterUtils.navigate(`/subscription/unsubscribed?e=${encodeURIComponent(this.address)}`);
    } catch {
      this.actionState = "error";
      this.errorMessage = content.confirm.genericError;
    } finally {
      this.updateHTML();
    }
  }

  /**
   * Starts the invalid-link recovery action for a valid replacement address.
   *
   * Success is kept in this component so the visitor can see the confirmation
   * without leaving the recovery view.
   */
  @BindEvent({ event: "click", id: "#reissue-action" })
  reissue(): void {
    if (!this.isValidEmail()) return;
    this.runAction("reissue", async () => {
      await this.subscriptionService.initiate(this.reissueEmail.trim());
      this.reissueSent = true;
    });
  }

  /**
   * Stores replacement-link input and resets prior action feedback.
   *
   * A new value must return the control to idle; otherwise the old success or
   * failure label would describe a different address.
   */
  @BindEvent({ event: "input", id: "#reissue-email" })
  updateEmail(event: Event): void {
    this.reissueEmail = (event.target as HTMLInputElement).value;
    this.reissueSent = false;
    this.actionState = "idle";
    this.errorMessage = "";
    this.updateHTML();
  }

  /**
   * Returns the visitor to the blog subscription form.
   *
   * The unsubscribe receipt cannot restore a deleted subscription in place, so
   * the next subscription attempt belongs to the blog's email form.
   */
  @BindEvent({ event: "click", id: "#subscribe-again-action" })
  subscribeAgain(): void {
    RouterUtils.navigate("/blog");
  }

  /**
   * Applies the replacement-email predicate shared by render and click guards.
   *
   * Keeping one check for both paths makes the disabled state reflect the same
   * condition that the event handler enforces.
   */
  private isValidEmail(): boolean {
    return /\S+@\S+\.\S+/.test(this.reissueEmail.trim());
  }

  /**
   * Runs one named action through the shared pending/terminal lifecycle.
   *
   * The delay exposes progress, forced demo failures become recoverable errors,
   * and the success callback is invoked only after the action remains valid.
   */
  private runAction(action: "reissue", onSuccess: () => void | Promise<void>): void {
    if (this.actionState === "pending") return;
    this.actionState = "pending";
    this.errorMessage = "";
    this.updateHTML();
    this.pendingTimer = window.setTimeout(() => {
      this.pendingTimer = null;
      if (this.forceFailure) {
        this.actionState = "error";
        this.errorMessage = content.confirm.genericError;
      } else {
        void Promise.resolve(onSuccess())
          .then(() => { this.actionState = "success"; })
          .catch(() => {
            this.actionState = "error";
            this.errorMessage = content.confirm.genericError;
          })
          .finally(() => this.updateHTML());
        return;
      }
      this.updateHTML();
    }, DEFAULT_DELAY);
  }

  /**
   * Converts authored fact tuples into the list rows used by both flow views.
   *
   * Keeping this shape shared ensures confirmation and receipt explain the
   * subscription change with the same ordering and labels.
   */
  private renderFacts(facts: readonly (readonly [string, string])[]) {
    return facts.map(([title, body]) => html`<li><b>${title}</b><span>${body}</span></li>`);
  }

  /**
   * Builds a stateful action button from its labels and current lifecycle.
   *
   * The helper centralizes disabled behavior and glyph selection so unsubscribe,
   * unsubscribe and reissue cannot drift into different pending semantics.
   */
  private renderButton(id: string, label: string, busy: string, done: string, fail: string, state: ActionState, disabled = false) {
    const currentLabel = state === "pending" ? busy : state === "success" ? done : state === "error" ? fail : label;
    return disabled || state === "pending"
      ? html`<button class="unsubscribe-act" id="${id}" type="button" data-state="${state}" disabled>${actionGlyph(state)}<span>${currentLabel}</span></button>`
      : html`<button class="unsubscribe-act" id="${id}" type="button" data-state="${state}">${actionGlyph(state)}<span>${currentLabel}</span></button>`;
  }

  /**
   * Selects the route view from the public `view` property.
   *
   * Both branches remain pure render selection; lifecycle and action handlers
   * prepare the state each branch consumes.
   */
  render() {
    return this.view === "done" ? this.renderDone() : this.renderConfirm();
  }

  /**
   * Wraps a flow body in the newsletter hero chrome.
   *
   * Confirm and receipt views provide only their route-specific body, which keeps
   * private-route framing consistent between both pages; site chrome is supplied
   * by the route shell through the shared `app-header` and `app-footer`.
   */
  private renderShell(title: string, intro: string, body: ReturnType<typeof html>) {
    return html`
      <main class="unsubscribe-page">
        <section class="layout-content layout-section-hero unsubscribe-hero"><div class="layout-stack-lg layout-measure"><p class="type-eyebrow unsubscribe-eyebrow">${content.common.eyebrow}</p><h1 class="type-display unsubscribe-hero-title">${title}</h1><p class="type-lede unsubscribe-lead">${intro}</p></div></section>
        ${body}
      </main>
    `;
  }

  /**
   * Renders the confirmation branch for loading, invalid, or ready state.
   *
   * Ready exposes unsubscribe, invalid exposes reissue, and loading exposes no
   * action; all branches share the same authored hero and error placement.
   */
  private renderConfirm() {
    const confirm = content.confirm;
    const ready = this.confirmState === "ready";
    const invalid = this.confirmState === "invalid";
    const body = ready ? html`<section class="layout-content layout-section-flush unsubscribe-section"><div class="unsubscribe-card"><p class="type-label">${confirm.addressLabel}</p><p class="unsubscribe-address"><span aria-hidden="true"></span>${this.address}</p><ul class="unsubscribe-facts">${this.renderFacts(confirm.facts)}</ul></div><div class="unsubscribe-decision"><div class="layout-row">${this.renderButton("unsubscribe-action", confirm.unsubscribeLabel, confirm.unsubscribeBusy, confirm.unsubscribeDone, confirm.unsubscribeFail, this.actionState, !this.token)}<a class="unsubscribe-quiet" href="/">${confirm.keepLabel}</a></div>${when(!!this.errorMessage, html`<p class="unsubscribe-error" role="alert">${this.errorMessage}</p>`)}</div><p class="unsubscribe-aside">${confirm.wrongAddress} <a href="/subscription/unsubscribe">${confirm.manageDifferent}</a>.</p></section>`
      : invalid ? html`<section class="layout-content layout-section-flush unsubscribe-section"><div class="unsubscribe-card"><h2 class="type-subsection">${confirm.invalidTitle}</h2><p class="unsubscribe-meta">${confirm.invalidBody}</p><div class="unsubscribe-field-row"><label class="visually-hidden" for="reissue-email">${confirm.emailLabel}</label><input class="unsubscribe-field" id="reissue-email" type="email" inputmode="email" autocomplete="email" placeholder="${confirm.emailPlaceholder}" value="${this.reissueEmail}" />${this.renderButton("reissue-action", confirm.reissueLabel, confirm.reissueBusy, confirm.reissueDone, confirm.reissueFail, this.actionState, !this.isValidEmail())}</div>${when(!!this.errorMessage, html`<p class="unsubscribe-error" role="alert">${this.errorMessage}</p>`)}${when(this.reissueSent, html`<p class="unsubscribe-success" role="status">${confirm.reissueSuccess}</p>`)}</div><p class="unsubscribe-aside">${confirm.manualHelp}</p></section>`
      : html`<section class="layout-content layout-section-flush unsubscribe-section"><div class="unsubscribe-card"><p class="unsubscribe-meta">${confirm.loading}</p></div></section>`;
    return this.renderShell(confirm.title, confirm.intro, body);
  }

  /**
   * Renders the completed receipt and its follow-up actions.
   *
   * The receipt includes the captured address, timestamp, a route to subscribe
   * again, and authored exits so the completed route remains useful afterward.
   */
  private renderDone() {
    const done = content.done;
    const exits = done.exits.map(([label, description, href]) => html`<li><a href="${href}"><span>${label} <span class="unsubscribe-arrow" aria-hidden="true">→</span></span><span>${description}</span></a></li>`);
    const body = html`<section class="layout-content layout-section-flush layout-section unsubscribe-section"><div class="unsubscribe-card"><p class="type-label">${done.addressLabel}</p><p class="unsubscribe-receipt"><span>${this.address}</span><time>${new Date().toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time></p><ul class="unsubscribe-facts">${this.renderFacts(done.facts)}</ul></div><div class="unsubscribe-subscribe-again"><div class="layout-row"><button class="unsubscribe-act" id="subscribe-again-action" type="button">${done.subscribeAgainLabel}</button><p class="unsubscribe-meta">${done.subscribeAgainHint}</p></div></div></section><section class="layout-content layout-section-flush layout-section-end unsubscribe-section"><div class="layout-stack-lg"><h2 class="type-subsection">${done.exitsTitle}</h2><ul class="unsubscribe-exits">${exits}</ul><p class="unsubscribe-meta">${done.exitsNote}</p></div></section>`;
    return this.renderShell(done.title, done.intro, body);
  }
}
