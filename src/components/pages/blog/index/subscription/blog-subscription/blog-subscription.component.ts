import {ApplicationEventService, BaseElement, BindEvent, Component, HTML} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {blogIndexContent} from "@app/data/blog-content.ts";
import {ACTION_BUTTON_REFRESH_EVENT, ACTION_BUTTON_TRIGGER_EVENT, type ActionButtonPayload, type ActionButtonTrigger} from "@app/events/action-button.events.ts";
import {actionButtonRegistry} from "@app/service/action-button-registry.service.ts";

/**
 * Presents the blog's low-volume email subscription prompt.
 *
 * It appears at the end of the blog index and owns only subscription-specific concerns:
 * the browser's email validity and the local unavailable state. The form remains available
 * while the static deployment deliberately skips any subscription API request.
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

  /** Removes this route instance's action handler when navigation destroys the subscription form. */
  private removeHandler: (() => void) | null = null;

  /** Removes this route instance's email-validity guard when navigation destroys the subscription form. */
  private removeGuard: (() => void) | null = null;

  constructor() {
    super();
  }

  /** Registers the local action and native-validity guard before visitors can trigger this form. */
  @OnEvent("connected", true)
  onConnected(): void {
    this.removeHandler = actionButtonRegistry.registerHandler("subscription.submit", (payload) => this.skipSubscriptionRequest(payload));
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

  /** Supports Enter in the email field without duplicating the action button's click behavior. */
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

  /** Validates the local form value, then deliberately skips the removed server API. */
  private async skipSubscriptionRequest(payload: ActionButtonPayload): Promise<void> {
    if (typeof payload.email !== "string") {
      throw new Error("Subscription email is missing.");
    }

    throw new Error("Article updates are not available yet.");
  }

  /** Reads the mounted email input's native required and email constraints for the registered action guard. */
  private isEmailValid(): boolean {
    const email = this.querySelector<HTMLInputElement>("#blog-email");
    return email?.validity.valid ?? false;
  }

  /** Renders the retained subscription form with a local unavailable-state message. */
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
