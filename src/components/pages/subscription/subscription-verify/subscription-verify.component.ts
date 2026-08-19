import { BaseElement, BindEvent, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html, when } from "@ayu-sh-kr/dota-wrap/rendering";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { subscriptionVerifyContent as content, type SubscriptionVerifyState } from "@app/data/subscription-verify-content.ts";
import { SubscriptionService, type SubscriptionResponseEntity } from "@app/service/subscription.service.ts";
import { markSubscriptionNoIndex, readSubscriptionToken } from "@app/utils/subscription-route.utils.ts";

const FLOOR = 700;

/**
 * Confirms the single-use newsletter token and publishes one terminal page state.
 *
 * The route starts in a visible working state, keeps the request on screen for
 * a short minimum duration, then maps the backend result to verified, already,
 * expired, or failed content. Expired links can request a fresh link in place.
 *
 * Selector: `subscription-verify`.
 */
@Component({ selector: "subscription-verify", shadow: false })
export class SubscriptionVerifyComponent extends BaseElement {
  private state: SubscriptionVerifyState = "working";
  private token = "";
  private email = "";
  private resendEmail = "";
  private resendMessage = "";
  private resendError = "";
  private retryError = "";
  private verificationPending = false;
  private resendPending = false;
  private requestStarted = 0;
  private readonly subscriptionService = new SubscriptionService();

  constructor() {
    super();
  }

  /**
   * Initializes the verification attempt from the current email link.
   *
   * It captures token and address hints, adds the no-index directive, renders the
   * working shell, and starts the asynchronous confirmation without blocking the
   * connected lifecycle handler.
   */
  @OnEvent("connected", true)
  initialize(): void {
    const params = new URLSearchParams(window.location.search);
    this.token = readSubscriptionToken(params);
    this.email = params.get("e") || params.get("email") || "";
    this.resendEmail = this.email;
    markSubscriptionNoIndex();
    this.updateHTML();
    void this.verify();
  }

  /**
   * Restarts confirmation from the failed-state retry control.
   *
   * The pending guard prevents duplicate requests while preserving the same
   * minimum-duration and response classification path as the first attempt.
   */
  @BindEvent({ event: "click", id: "#subscription-retry" })
  retry(): void {
    if (this.verificationPending) return;
    void this.verify();
  }

  /**
   * Stores the address being used for a replacement link.
   *
   * Clearing both feedback values on input ensures a message for an older
   * address cannot remain beside the new resend field.
   */
  @BindEvent({ event: "input", id: "#subscription-resend-email" })
  updateResendEmail(event: Event): void {
    this.resendEmail = (event.target as HTMLInputElement).value;
    this.resendError = "";
    this.resendMessage = "";
    this.updateHTML();
  }

  /**
   * Starts a replacement-link request from the expired state.
   *
   * Invalid, already-successful, or pending forms return early; valid input is
   * handed to the async request method that owns transport and feedback.
   */
  @BindEvent({ event: "click", id: "#subscription-resend" })
  resend(): void {
    if (!this.isValidEmail() || this.resendMessage || this.resendPending) return;
    void this.sendNewLink();
  }

  /**
   * Confirms the token and publishes one terminal verification state.
   *
   * The working state is rendered before transport begins, and both success and
   * failure wait for the same floor so network speed does not cause a flashing
   * page. Failure stores retry guidance before publishing `failed`.
   */
  private async verify(): Promise<void> {
    if (!this.token) {
      this.publish("expired");
      return;
    }

    this.retryError = "";
    this.verificationPending = true;
    this.publish("working");
    this.requestStarted = Date.now();

    try {
      const response = await this.subscriptionService.confirm(this.token);
      await this.waitForFloor();
      this.publish(this.resolveResponse(response));
    } catch {
      await this.waitForFloor();
      this.retryError = content.states.failed.retryError;
      this.publish("failed");
    } finally {
      this.verificationPending = false;
      this.updateHTML();
    }
  }

  /**
   * Maps the backend response into the route's four supported outcomes.
   *
   * A verified response requires HTTP 200 and the documented `VERIFIED` state.
   * Known invalid-token statuses become recovery content, while every other
   * response throws so the caller can expose the retry state.
   */
  private resolveResponse(response: SubscriptionResponseEntity): SubscriptionVerifyState {
    const data = response.data;
    if (response.status === 200 && data.status?.toUpperCase() === "VERIFIED") return "verified";
    if ([400, 404, 410].includes(response.status) || ["EXPIRED", "TOKEN_EXPIRED"].includes(data.code?.toUpperCase() ?? "")) return "expired";
    throw new Error(`Verification request failed with status ${response.status}.`);
  }

  /**
   * Requests a new verification email for the expired-link recovery form.
   *
   * The method owns pending state and rerenders around the request. Only a 2xx
   * `PENDING` response becomes success; transport or contract failures remain
   * visible as resend errors.
   */
  private async sendNewLink(): Promise<void> {
    this.resendError = "";
    this.resendPending = true;
    this.updateHTML();
    try {
      await this.subscriptionService.initiate(this.resendEmail.trim());
      this.resendMessage = content.states.expired.resendSuccess;
    } catch {
      this.resendError = "Still not reaching the server. Give it a minute.";
    } finally {
      this.resendPending = false;
    }
    this.updateHTML();
  }

  /**
   * Delays completion until the verification card has been visible for `FLOOR`.
   *
   * It is called by both success and failure branches, making the route's timing
   * contract independent of backend latency.
   */
  private async waitForFloor(): Promise<void> {
    const remaining = Math.max(0, FLOOR - (Date.now() - this.requestStarted));
    if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining));
  }

  /**
   * Applies the route's lightweight replacement-email validation.
   *
   * Render and click handling use this same predicate so the disabled control
   * and the event guard cannot disagree about whether resend is available.
   */
  private isValidEmail(): boolean {
    return /\S+@\S+\.\S+/.test(this.resendEmail.trim());
  }

  /**
   * Commits a verification state and synchronizes browser chrome with it.
   *
   * The state selects authored copy in `render()`, while the title gives the
   * same outcome to browser history and assistive technology outside the card.
   */
  private publish(state: SubscriptionVerifyState): void {
    this.state = state;
    document.title = `${content.states[state].title.replace(/[.…]$/, "")} — The Dispatch`;
    this.updateHTML();
  }

  /**
   * Renders the stable verification shell around the current state card.
   *
   * It reads authored navigation and state content only; network work and title
   * updates stay in lifecycle/event methods so rendering remains pure.
   */
  render() {
    const common = content.common;
    const state = content.states[this.state];
    return html`
      <main class="subscription-verify-page">
        <section class="layout-content layout-section-hero subscription-verify-hero">
          <div class="layout-stack-lg layout-measure">
            <p class="type-eyebrow subscription-verify-eyebrow">${common.eyebrow}</p>
            <h1 class="type-display subscription-verify-hero-title">${state.title}</h1>
            <p class="type-lede subscription-verify-lead">${state.intro}</p>
          </div>
        </section>
        ${this.renderState()}
      </main>
    `;
  }

  /**
   * Selects the card for working, verified, already, expired, or failed state.
   *
   * Only verified and already states receive authored route exits; expired owns
   * resend controls and failed owns retry controls, matching each recovery path.
   */
  private renderState() {
    if (this.state === "working") {
      const working = content.states.working;
      return html`<section class="layout-content layout-section-flush layout-section subscription-verify-state" role="status" aria-live="polite"><div class="subscription-verify-card"><p class="type-label">${working.loading}</p><div class="subscription-verify-pulse" aria-hidden="true"><span></span></div></div></section>`;
    }
    if (this.state === "verified") {
      const verified = content.states.verified;
      const facts = verified.facts.map(([title, body]) => html`<li><b>${title}</b><span>${body}</span></li>`);
      return html`<section class="layout-content layout-section-flush layout-section subscription-verify-state"><div class="subscription-verify-card"><p class="type-label">${verified.addressLabel}</p><p class="subscription-verify-address"><span aria-hidden="true"></span>${this.email || "the confirmed address"}</p><ul class="subscription-verify-facts">${facts}</ul></div>${this.renderExits()}</section>`;
    }
    if (this.state === "already") {
      return html`<section class="layout-content layout-section-flush layout-section subscription-verify-state"><div class="subscription-verify-card"><p class="subscription-verify-meta">${content.states.already.body}</p></div>${this.renderExits()}</section>`;
    }
    if (this.state === "expired") {
      const expired = content.states.expired;
      const resendButton = !this.isValidEmail() || !!this.resendMessage || this.resendPending
        ? html`<button class="subscription-verify-action" id="subscription-resend" type="button" disabled>${this.resendPending ? expired.resendBusy : expired.resendLabel}</button>`
        : html`<button class="subscription-verify-action" id="subscription-resend" type="button">${expired.resendLabel}</button>`;
      return html`<section class="layout-content layout-section-flush layout-section subscription-verify-state"><div class="subscription-verify-card"><h2 class="type-subsection">${expired.title}</h2><p class="subscription-verify-meta">${expired.body}</p><div class="subscription-verify-field-row"><label class="visually-hidden" for="subscription-resend-email">${expired.emailLabel}</label><input class="subscription-verify-field" id="subscription-resend-email" type="email" inputmode="email" autocomplete="email" placeholder="${expired.emailPlaceholder}" value="${this.resendEmail}" />${resendButton}</div>${when(!!this.resendError, html`<p class="subscription-verify-error" role="alert">${this.resendError}</p>`)}${when(!!this.resendMessage, html`<p class="subscription-verify-success" role="status">${this.resendMessage}</p>`)}</div></section>`;
    }
    const failed = content.states.failed;
    const retryButton = this.verificationPending
      ? html`<button class="subscription-verify-action" id="subscription-retry" type="button" disabled>${failed.retryBusy}</button>`
      : html`<button class="subscription-verify-action" id="subscription-retry" type="button">${failed.retryLabel}</button>`;
    return html`<section class="layout-content layout-section-flush layout-section subscription-verify-state"><div class="subscription-verify-card"><p class="subscription-verify-meta">${failed.body}</p><div class="subscription-verify-action-row">${retryButton}</div>${when(!!this.retryError, html`<p class="subscription-verify-error" role="alert">${this.retryError}</p>`)}<p class="subscription-verify-meta subscription-verify-help">${failed.manualHelp}</p></div></section>`;
  }

  /**
   * Renders authored next-step links for terminal confirmation states.
   *
   * The preference link carries the current token when one exists, preserving
   * the authenticated flow without exposing it in unrelated route links.
   */
  private renderExits() {
    const exits = content.exits.map(([label, description, href]) => {
      const target = href === "/subscription/preference" && this.token
        ? `${href}?token=${encodeURIComponent(this.token)}`
        : href;
      return html`<li><a href="${target}"><span>${label} <span aria-hidden="true">→</span></span><span>${description}</span></a></li>`;
    });
    return html`<ul class="subscription-verify-exits">${exits}</ul>`;
  }
}
