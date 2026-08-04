import {ApplicationEventService, BaseElement, BindEvent, Component, HTML} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {blogIndexContent} from "@app/data/blog-content.ts";
import {ACTION_BUTTON_REFRESH_EVENT, ACTION_BUTTON_TRIGGER_EVENT, type ActionButtonPayload, type ActionButtonTrigger} from "@app/events/action-button.events.ts";
import {actionButtonRegistry} from "@app/service/action-button-registry.service.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

/**
 * Presents the blog's low-volume email subscription prompt.
 *
 * It appears at the end of the blog index and owns only subscription-specific concerns:
 * current-field validity and the Nitro request. The nested `action-button` owns no API work;
 * it publishes a named request, while this component registers the matching handler on
 * connect. The dispatcher settles the button over the event bus after Nitro records a
 * privacy-safe log summary rather than enrolling the address with a provider.
 *
 * Selector: `blog-subscription`.
 */
@Component({
  selector: "blog-subscription",
  shadow: false,
})
export class BlogSubscriptionComponent extends BaseElement {
  /** Publishes keyboard-submit triggers and guard refreshes without coupling the form to the generic renderer. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Removes this route instance's endpoint handler when navigation destroys the subscription form. */
  private removeHandler: (() => void) | null = null;

  /** Removes this route instance's email-validity guard when navigation destroys the subscription form. */
  private removeGuard: (() => void) | null = null;

  constructor() {
    super();
  }

  /**
   * Registers the endpoint work and native-validity guard before visitors can trigger this form.
   *
   * Registration lives with the feature that understands the payload; the generic button and
   * dispatcher can therefore remain reusable across unrelated asynchronous actions.
   */
  @OnEvent("connected", true)
  onConnected(): void {
    this.removeHandler = actionButtonRegistry.registerHandler("subscription.submit", (payload) => this.recordSubscription(payload));
    this.removeGuard = actionButtonRegistry.registerGuard("blog-subscription", () => this.isEmailValid());
    this.refreshActionButton();
  }

  /** Removes both registrations on disconnect so a later blog route can register fresh form references. */
  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.removeHandler?.();
    this.removeHandler = null;
    this.removeGuard?.();
    this.removeGuard = null;
  }

  /** Publishes a scoped refresh after input so the action-button recalculates this form's current browser validity. */
  @BindEvent({event: "input", id: ".blog-subscribe-form"})
  refreshActionButton(): void {
    void this.publisher.publishAsync({name: ACTION_BUTTON_REFRESH_EVENT, data: {guard: "blog-subscription"}});
  }

  /**
   * Supports Enter in the email field without duplicating the action button's click behavior.
   *
   * The custom button is intentionally `type=button`, so the form is responsible for turning
   * the browser's implicit submit gesture into the same typed action trigger. It finds the
   * delegated form defensively because the Dota binding may retain the component as `currentTarget`.
   */
  @BindEvent({event: "submit", id: ".blog-subscribe-form"})
  submitSubscription(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.target instanceof HTMLFormElement
      ? event.target
      : this.querySelector<HTMLFormElement>(".blog-subscribe-form");
    if (!form || !form.reportValidity()) {
      return;
    }

    void this.publisher.publishAsync({
      name: ACTION_BUTTON_TRIGGER_EVENT,
      data: {
        action: "subscription.submit",
        id: "blog-subscription-submit",
        payload: Object.fromEntries(new FormData(form).entries()),
      } satisfies ActionButtonTrigger,
    });
  }

  /**
   * Sends a validated subscription request to Nitro's placeholder endpoint.
   *
   * The endpoint only logs a privacy-safe summary for now; a successful response therefore
   * records the existing analytics conversion instead of implying that a mailing-list provider
   * has stored the address. It rejects malformed payloads and non-OK responses so the dispatcher
   * publishes the shared failure lifecycle rather than this component managing button state.
   *
   * @param payload - Closest-form values collected by the action button at interaction time.
   */
  private async recordSubscription(payload: ActionButtonPayload): Promise<void> {
    const email = payload.email;
    if (typeof email !== "string") {
      throw new Error("Subscription email is missing.");
    }

    const response = await fetch("/api/subscription", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email, source: "blog_index"}),
    });
    if (!response.ok) {
      throw new Error(`Subscription request failed (${response.status})`);
    }

    publishAnalyticsEvent({
      eventName: "subscription_submit",
      params: {status: "submitted", surface: "blog_index"},
    });
  }

  /** Reads the mounted email input's native required and email constraints for the registered action guard. */
  private isEmailValid(): boolean {
    const email = this.querySelector<HTMLInputElement>("#blog-email");
    return email?.validity.valid ?? false;
  }

  /**
   * Renders the blog-index form and declares the action name, unique ID, guard, and lifecycle labels consumed by `action-button`.
   */
  render(): string {
    return HTML`
      <section class="blog-subscribe" aria-label="${blogIndexContent.subscription.ariaLabel}">
        <div class="blog-container blog-subscribe-inner">
          <div><p class="blog-subscribe-title">${blogIndexContent.subscription.title}</p><p class="blog-subscribe-copy">${blogIndexContent.subscription.copy}</p></div>
          <div>
            <form class="blog-subscribe-form">
              <label class="sr-only" for="blog-email">${blogIndexContent.subscription.emailLabel}</label>
              <div class="blog-subscribe-controls">
                <input id="blog-email" name="email" type="email" placeholder="${blogIndexContent.subscription.emailPlaceholder}" autocomplete="email" aria-describedby="blog-email-hint" required />
                <action-button id="blog-subscription-submit" action="subscription.submit" guard="blog-subscription" variant="ink" label="${blogIndexContent.subscription.submitLabel}" busy-label="${blogIndexContent.subscription.submittingLabel}" done-label="${blogIndexContent.subscription.successLabel}" fail-label="${blogIndexContent.subscription.errorLabel}"></action-button>
              </div>
              <p id="blog-email-hint" class="blog-subscribe-hint">${blogIndexContent.subscription.emailHint}</p>
            </form>
          </div>
        </div>
      </section>
    `;
  }
}
